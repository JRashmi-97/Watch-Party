# SyncWatch - YouTube Watch Party System

A real-time, synchronized YouTube watch party system built with a modern React frontend and an object-oriented Node.js/Socket.IO backend.

## ✨ Features
*   **Real-time Synchronization**: Uses WebSockets to ensure all viewers see the exact same video state (play, pause, seek, change video).
*   **Role-Based Access Control (RBAC)**:
    *   **Host**: Full control over playback, video selection, and user management.
    *   **Moderator**: Can control playback and change videos.
    *   **Participant**: Watch-only mode. Controls are disabled to prevent accidental disruption.
*   **Host Auto-Transfer**: If the host leaves, the oldest remaining participant is automatically promoted to Host.
*   **Smart YouTube URL Parser**: Simply paste any YouTube link, and the system intelligently extracts the video ID to start the party.
*   **Resilient Connectivity**: Features a 5-second reconnection buffer to retain your role and sync state seamlessly if you accidentally refresh the page.
*   **Mobile-Responsive UI**: Fully optimized layout that looks and works great across desktop and mobile devices.

## 🚀 Tech Stack
*   **Frontend**: React, TypeScript, Vite, TailwindCSS v4, React-Player (YouTube IFrame API).
*   **Backend**: Node.js, Express, TypeScript, Socket.IO.
*   **Database**: SQLite for lightweight, reliable persistent storage of rooms and participants, enabling robust reconnections.

## 💻 Running Locally

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
*The backend will run on `http://localhost:3001`.*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`. Open this URL in multiple browser tabs to test the real-time synchronization.*

## 🌐 Deployment Instructions

To deploy this project so it's accessible via a public URL, follow these steps:

### Backend (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your repository and select the `backend` directory.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Once deployed, copy the Render URL.

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. Set the Root Directory to `frontend`.
3. In `frontend/src/pages/Room.tsx`, update the Socket connection URL from `http://localhost:3001` to your new Render backend URL.
4. Click **Deploy**.

## 🧠 Code Highlights
The WebSocket logic is highly optimized to prevent "infinite loop" events. Instead of using laggy timeouts (`setTimeout`), the frontend explicitly validates the local `isPlaying` state and current timeline `onProgress` before emitting any redundant Socket events. Combined with the absolute-positioned video container that prevents layout collapse and robust server-side role management, this ensures buttery smooth, lag-free synchronization.
