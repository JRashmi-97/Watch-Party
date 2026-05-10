import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ReactPlayer from 'react-player';

let socket: Socket;

interface Participant {
  id: string;
  username: string;
  role: string;
}

const Room = () => {
  const Player = (ReactPlayer as any).default || ReactPlayer;
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Video State
  const [videoState, setVideoState] = useState({
    videoId: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    isPlaying: false,
    currentTime: 0
  });
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const playerRef = useRef<any>(null);
  const localTimeRef = useRef(0);

  const username = location.state?.username;
  const currentUserRole = participants.find(p => p.id === socketId)?.role || participants.find(p => p.username === username)?.role;
  const hasControl = currentUserRole === 'Host' || currentUserRole === 'Moderator';

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId(socket.id || '');
      setIsConnected(true);
      socket.emit('join_room', { roomId, username });
    });

    socket.on('error', (msg) => {
      alert(msg);
      navigate('/');
    });

    socket.on('room_state', (data) => {
      setParticipants(data.participants);
      setIsLocked(data.isLocked || false);
    });
    socket.on('user_joined', (data) => setParticipants(data.participants));
    socket.on('user_left', (data) => setParticipants(data.participants));
    socket.on('role_assigned', (data) => setParticipants(data.participants));

    // Video Sync Events
    socket.on('sync_state', (state) => {
      setVideoState({
        videoId: state.videoId,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime
      });
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && Math.abs(localTimeRef.current - state.currentTime) > 2) {
        playerRef.current.seekTo(state.currentTime, 'seconds');
      }
    });

    socket.on('play', ({ time }) => {
      setVideoState(prev => ({ ...prev, isPlaying: true }));
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && Math.abs(localTimeRef.current - time) > 2) {
        playerRef.current.seekTo(time, 'seconds');
      }
    });

    socket.on('pause', ({ time }) => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && Math.abs(localTimeRef.current - time) > 2) {
        playerRef.current.seekTo(time, 'seconds');
      }
    });

    socket.on('seek', ({ time }) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && Math.abs(localTimeRef.current - time) > 2) {
        playerRef.current.seekTo(time, 'seconds');
      }
    });

    socket.on('change_video', ({ videoId }) => {
      setVideoState({ videoId, isPlaying: true, currentTime: 0 });
    });

    socket.on('kicked', () => {
      alert('You have been removed from the room.');
      navigate('/');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, username, navigate]);

  const handlePlay = () => {
    if (!hasControl || !socketRef.current) return;
    const time = localTimeRef.current;
    
    setVideoState(prev => {
      if (prev.isPlaying) return prev;
      socketRef.current?.emit('play', { time });
      return { ...prev, isPlaying: true };
    });
  };

  const handlePause = () => {
    if (!hasControl || !socketRef.current) return;
    const time = localTimeRef.current;
    
    setVideoState(prev => {
      if (!prev.isPlaying) return prev;
      socketRef.current?.emit('pause', { time });
      return { ...prev, isPlaying: false };
    });
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    localTimeRef.current = state.playedSeconds;
  };

  const handleReady = () => {
    socketRef.current?.emit('request_sync');
  };

  const handleChangeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasControl || !newVideoUrl.trim() || !socketRef.current) return;

    let finalId = newVideoUrl.trim();
    try {
      if (finalId.includes('youtube.com') || finalId.includes('youtu.be')) {
         const match = finalId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
         if (match && match[1]) finalId = match[1];
      }
    } catch (e) {}

    socketRef.current.emit('change_video', { videoId: finalId });
    setNewVideoUrl('');
  };

  const handleAssignRole = (userId: string, role: string) => {
    socketRef.current?.emit('assign_role', { userId, role });
  };

  const handleRemoveParticipant = (userId: string) => {
    if (confirm('Are you sure you want to remove this participant?')) {
      socketRef.current?.emit('remove_participant', { userId });
    }
  };

  const toggleLock = () => {
    socketRef.current?.emit('lock_room', { locked: !isLocked });
  };

  if (!username) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-transparent text-text relative overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden z-10 min-h-[50vh] md:min-h-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Watch Party</h1>
            <p className="text-sm text-gray-400 mt-1 flex flex-wrap items-center gap-2">
              Room Code: <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">{roomId}</span>
              {isLocked && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Locked</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            {currentUserRole === 'Host' && (
              <button onClick={toggleLock} className={`text-xs px-3 py-2 md:py-1.5 rounded-lg font-bold transition-all ${isLocked ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                {isLocked ? 'Unlock Room' : 'Lock Room'}
              </button>
            )}
            {hasControl && (
              <form onSubmit={handleChangeVideo} className="flex gap-2 flex-1 md:flex-initial">
                <input 
                  type="text" 
                  value={newVideoUrl}
                  onChange={e => setNewVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL..." 
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm w-full md:w-72 focus:outline-none focus:border-blue-500 placeholder:text-gray-600 shadow-inner"
                />
                <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                  Play
                </button>
              </form>
            )}
            <div className="hidden md:flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium text-gray-300">{isConnected ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 glass-panel rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] relative min-h-[250px] md:min-h-0">
           {!hasControl && !hasInteracted && (
             <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center px-4">
               <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
               <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Host is controlling the video</h2>
               <p className="text-gray-400 mb-8 max-w-sm">Browsers block automatic video playback. Click below to synchronize and unlock audio.</p>
               <button 
                 onClick={() => {
                   setHasInteracted(true);
                   socketRef.current?.emit('request_sync');
                 }}
                 className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 px-8 py-4 rounded-xl text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all active:scale-95 animate-[blob_2s_infinite_alternate]"
               >
                 Unlock Video & Audio
               </button>
             </div>
           )}

           {!hasControl && (
             <div className="absolute top-6 left-6 z-40 bg-black/60 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full font-medium border border-white/10 shadow-lg flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
               Viewing Only (Controls Disabled)
             </div>
           )}
           <div className="absolute inset-0">
             <Player 
                ref={playerRef}
                url={(videoState.videoId || 'M7lc1UVf-VE').includes('http') ? (videoState.videoId || 'M7lc1UVf-VE') : `https://www.youtube.com/watch?v=${videoState.videoId || 'M7lc1UVf-VE'}`}
                width="100%"
                height="100%"
                playing={videoState.isPlaying}
                controls={true}
                onPlay={handlePlay}
                onPause={handlePause}
                onProgress={handleProgress}
                onReady={handleReady}
                config={{
                  youtube: {
                    playerVars: {
                      disablekb: hasControl ? 0 : 1, // Disable keyboard shortcuts for participants
                      modestbranding: 1
                    }
                  }
                }}
             />
           </div>
           {!hasControl && (
             <div className="absolute inset-0 z-20 bg-transparent" />
           )}
        </div>
      </div>

      <div className="w-full md:w-80 glass-panel md:border-y-0 md:border-r-0 md:border-l border-t md:border-t-0 border-white/5 p-4 md:p-6 flex flex-col shrink-0 z-10 md:h-auto h-[40vh]">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
          Participants
          <span className="bg-gray-800 text-gray-300 text-xs py-0.5 px-2 rounded-full">{participants.length}</span>
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-black/20 hover:bg-black/40 transition-colors p-3.5 rounded-2xl border border-white/5 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-200 font-medium text-sm">
                  {p.username} {p.username === username && <span className="text-gray-500 font-normal">(You)</span>}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                  p.role === 'Host' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  p.role === 'Moderator' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-gray-800 text-gray-400 border border-gray-700'
                }`}>
                  {p.role}
                </span>
                {currentUserRole === 'Host' && p.username !== username && (
                  <div className="flex gap-1 mt-1">
                    {p.role === 'Participant' && (
                      <button onClick={() => handleAssignRole(p.id, 'Moderator')} className="text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-0.5 rounded transition-colors">Make Mod</button>
                    )}
                    {p.role === 'Moderator' && (
                      <button onClick={() => handleAssignRole(p.id, 'Participant')} className="text-[10px] bg-gray-600/20 text-gray-400 hover:bg-gray-600/40 px-2 py-0.5 rounded transition-colors">Make User</button>
                    )}
                    <button onClick={() => handleRemoveParticipant(p.id)} className="text-[10px] bg-red-600/20 text-red-400 hover:bg-red-600/40 px-2 py-0.5 rounded transition-colors">Kick</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
