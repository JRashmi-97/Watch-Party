import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initDb } from './db';
import { RoomManager } from './models/RoomManager';
import { Participant, Role } from './models/Participant';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, username }) => {
    const room = roomManager.getOrCreateRoom(roomId);
    
    if (room.isLocked) {
      socket.emit('error', 'This room is locked by the host.');
      return;
    }

    // Check if this is a reconnection
    const existing = Array.from(room.participants.values()).find(p => p.username === username);
    if (existing) {
      // Reconnect the user and retain their role
      room.participants.delete(existing.id);
      existing.id = socket.id;
      existing.socket = socket;
      room.participants.set(socket.id, existing);
      
      socket.join(room.id);
      
      // Notify others that they are back (or just refresh their state)
      io.to(room.id).emit('user_joined', {
        participant: existing.toJSON(),
        participants: room.getParticipantsList()
      });

      socket.emit('sync_state', room.videoState);
      socket.emit('room_state', {
        participants: room.getParticipantsList(),
        room: room.id,
        isLocked: room.isLocked
      });
      return;
    }

    // Auto-assign host if no host currently exists
    const hasHost = Array.from(room.participants.values()).some(p => p.role === 'Host');
    const role: Role = !hasHost ? 'Host' : 'Participant';
    
    const participant = new Participant(socket, socket.id, username, role);
    room.addParticipant(participant);

    console.log(`${username} joined room ${roomId} as ${role}`);
  });
  // Helper function
  const getRoomAndCheckControl = (socketId: string) => {
    for (const room of roomManager.rooms.values()) {
      const p = room.getParticipantBySocketId(socketId);
      if (p) {
        const hasControl = p.role === 'Host' || p.role === 'Moderator';
        return { room, hasControl };
      }
    }
    return { room: undefined, hasControl: false };
  };

  socket.on('play', ({ time }) => {
    const { room, hasControl } = getRoomAndCheckControl(socket.id);
    if (room && hasControl) {
      room.videoState.isPlaying = true;
      room.videoState.currentTime = time;
      room.videoState.lastSyncTime = Date.now();
      io.to(room.id).emit('play', { time });
    }
  });

  socket.on('pause', ({ time }) => {
    const { room, hasControl } = getRoomAndCheckControl(socket.id);
    if (room && hasControl) {
      room.videoState.isPlaying = false;
      room.videoState.currentTime = time;
      room.videoState.lastSyncTime = Date.now();
      io.to(room.id).emit('pause', { time });
    }
  });

  socket.on('seek', ({ time }) => {
    const { room, hasControl } = getRoomAndCheckControl(socket.id);
    if (room && hasControl) {
      room.videoState.currentTime = time;
      room.videoState.lastSyncTime = Date.now();
      io.to(room.id).emit('seek', { time });
    }
  });

  socket.on('change_video', ({ videoId }) => {
    const { room, hasControl } = getRoomAndCheckControl(socket.id);
    if (room && hasControl) {
      room.videoState.videoId = videoId;
      room.videoState.currentTime = 0;
      room.videoState.isPlaying = true; // Auto-play new video
      room.videoState.lastSyncTime = Date.now();
      io.to(room.id).emit('change_video', { videoId });
    }
  });
  socket.on('assign_role', ({ userId, role }) => {
    const { room } = getRoomAndCheckControl(socket.id);
    const currentUser = room?.getParticipantBySocketId(socket.id);
    if (room && currentUser && currentUser.role === 'Host') {
      const targetUser = Array.from(room.participants.values()).find(p => p.id === userId);
      if (targetUser && targetUser.id !== currentUser.id) {
        targetUser.role = role;
        const payload = {
          userId: targetUser.id,
          username: targetUser.username,
          role,
          participants: room.getParticipantsList()
        };
        io.to(room.id).emit('role_assigned', payload);
      }
    }
  });

  socket.on('remove_participant', ({ userId }) => {
    const { room } = getRoomAndCheckControl(socket.id);
    const currentUser = room?.getParticipantBySocketId(socket.id);
    if (room && currentUser && currentUser.role === 'Host') {
      const targetUser = Array.from(room.participants.values()).find(p => p.id === userId);
      if (targetUser && targetUser.id !== currentUser.id) {
        targetUser.socket.emit('kicked');
        room.removeParticipant(userId);
      }
    }
  });

  socket.on('lock_room', ({ locked }) => {
    const { room } = getRoomAndCheckControl(socket.id);
    const currentUser = room?.getParticipantBySocketId(socket.id);
    if (room && currentUser && currentUser.role === 'Host') {
      room.isLocked = locked;
      io.to(room.id).emit('room_state', {
        participants: room.getParticipantsList(),
        room: room.id,
        isLocked: room.isLocked
      });
    }
  });

  socket.on('request_sync', () => {
    const { room } = getRoomAndCheckControl(socket.id);
    if (room) {
      let adjustedTime = room.videoState.currentTime;
      if (room.videoState.isPlaying) {
         adjustedTime += (Date.now() - room.videoState.lastSyncTime) / 1000;
      }
      socket.emit('sync_state', { ...room.videoState, currentTime: adjustedTime });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const disconnectedId = socket.id;
    
    // Give them 5 seconds to reconnect (e.g. page refresh) before completely removing them
    setTimeout(() => {
      for (const room of roomManager.rooms.values()) {
        const participant = room.participants.get(disconnectedId);
        if (participant) {
          room.removeParticipant(disconnectedId);
          if (room.participants.size === 0) {
              roomManager.removeRoom(room.id);
          }
          break;
        }
      }
    }, 5000);
  });
});

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(console.error);
