import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!username.trim()) return alert('Please enter a username');
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${newRoomId}`, { state: { username: username.trim() } });
  };

  const handleJoinRoom = () => {
    if (!username.trim()) return alert('Please enter a username');
    if (!roomId.trim()) return alert('Please enter a room code');
    navigate(`/room/${roomId.trim().toUpperCase()}`, { state: { username: username.trim() } });
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen p-6 md:p-12 relative overflow-hidden bg-slate-950">
      {/* Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>

      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <svg className="absolute bottom-0 w-full h-auto text-blue-500" viewBox="0 0 1440 320" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-16 z-10">
        {/* Left Column: Branding and Features */}
        <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-8 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            v2.0 is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 mb-6 tracking-tighter drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            Watch Party
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed">
            Experience YouTube together, perfectly synchronized. No lag, just pure cinematic vibes with your friends.
          </p>

          <div className="flex flex-col gap-5 max-w-md mx-auto lg:mx-0 text-left">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 text-xl border border-blue-500/20 shadow-inner">🚀</div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-wide">Real-Time Sync</h3>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">Play, pause, and seek instantly across all connected devices in the room.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 text-xl border border-purple-500/20 shadow-inner">🛡️</div>
              <div>
                <h3 className="text-white font-bold text-lg tracking-wide">Role-Based Access</h3>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">Assign moderators or securely lock your room to keep out unwanted guests.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: The Login Card */}
        <div className="flex-1 w-full max-w-md relative p-[2px] rounded-[24px] overflow-hidden group shadow-2xl mt-12 lg:mt-0">
          {/* Traveling Border Line */}
          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent_50%,#3b82f6_100%)] animate-[spin_3s_linear_infinite] group-hover:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_50%,#a855f7_100%)] opacity-70 transition-all duration-500"></div>
          
          <div className="glass-panel p-8 md:p-10 rounded-[22px] w-full h-full flex flex-col gap-6 relative bg-slate-900/90 backdrop-blur-2xl border-none">
            <div className="text-center mb-2">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Join the Party</h2>
              <p className="text-gray-400 text-sm">Enter your details to get started</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-300 ml-1 tracking-wide">Your Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-4 pl-12 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  👤
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-[0.98] mt-2 group flex justify-center items-center gap-2"
            >
              Create New Room
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <div className="flex items-center gap-4 my-2">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">or join existing</span>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-300 ml-1 tracking-wide">Room Code</label>
              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g. A1B2C3" 
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-4 pl-12 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all uppercase placeholder:text-gray-600 tracking-widest font-mono shadow-inner"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    🔑
                  </div>
                </div>
                <button 
                  onClick={handleJoinRoom}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-all active:scale-95"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
