import { Participant } from './Participant';
import { getDb } from '../db';

export interface VideoState {
  videoId: string;
  isPlaying: boolean;
  currentTime: number;
  lastSyncTime: number;
}

export class Room {
  public participants: Map<string, Participant> = new Map();
  public videoState: VideoState = {
    videoId: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', // Default YouTube video
    isPlaying: false,
    currentTime: 0,
    lastSyncTime: Date.now()
  };
  public isLocked: boolean = false;

  constructor(public id: string) {}

  public addParticipant(participant: Participant) {
    this.participants.set(participant.id, participant);
    participant.socket.join(this.id);
    
    // Broadcast to others in the room
    participant.socket.to(this.id).emit('user_joined', {
      participant: participant.toJSON(),
      participants: this.getParticipantsList()
    });

    // Send current state to the new participant
    participant.socket.emit('sync_state', this.videoState);
    participant.socket.emit('room_state', {
      participants: this.getParticipantsList(),
      room: this.id,
      isLocked: this.isLocked
    });

    // Log to DB
    getDb().run('INSERT OR REPLACE INTO participants (id, roomId, username, role) VALUES (?, ?, ?, ?)', 
      [participant.id, this.id, participant.username, participant.role])
      .catch(err => console.error('DB Error:', err));
  }

  public removeParticipant(participantId: string) {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.socket.leave(this.id);
      this.participants.delete(participantId);
      
      participant.socket.to(this.id).emit('user_left', {
        userId: participantId,
        participants: this.getParticipantsList()
      });
      
      // Log to DB
      getDb().run('DELETE FROM participants WHERE id = ?', [participantId])
        .catch(err => console.error('DB Error:', err));
      
      // Auto-transfer host if the Host leaves
      if (participant.role === 'Host' && this.participants.size > 0) {
        const nextHost = Array.from(this.participants.values())[0];
        nextHost.role = 'Host';
        
        // Notify everyone about the new host
        const updatePayload = {
          userId: nextHost.id,
          username: nextHost.username,
          role: 'Host',
          participants: this.getParticipantsList()
        };
        
        nextHost.socket.to(this.id).emit('role_assigned', updatePayload);
        nextHost.socket.emit('role_assigned', updatePayload);
      }
    }
  }

  public getParticipantsList() {
    return Array.from(this.participants.values()).map(p => p.toJSON());
  }

  public getParticipantBySocketId(socketId: string): Participant | undefined {
    return Array.from(this.participants.values()).find(p => p.socket.id === socketId);
  }
}
