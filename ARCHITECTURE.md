# Architecture Overview

This document outlines the design decisions and data flow for the SyncWatch application.

## 📡 WebSocket Integration & Data Flow

WebSockets (`Socket.IO`) provide full-duplex communication channels over a single TCP connection, making it the perfect choice for a real-time watch party system compared to HTTP polling.

### Typical Flow
1. **Connection**: Client connects to the backend WebSocket server and emits `join_room` with `roomId` and `username`.
2. **Room Management**: The backend checks if the room exists. If not, it creates a new `Room` instance. The user is added as a `Participant`. The first user is granted `Host`.
3. **State Syncing**: The backend immediately emits `sync_state` to the new user, containing the `videoId`, `currentTime`, and `isPlaying` status.
4. **Broadcasting Actions**: When a Host pauses the video, the client emits a `pause` event to the server. The backend validates the user's role. If valid, the backend updates the internal `Room` state and broadcasts the `pause` event to all other clients in that specific `roomId`.
5. **Client Reception**: Other clients receive the `pause` event and programmatically pause their local `ReactPlayer` instances.

## 🏗️ Object-Oriented Backend Design

Structuring the backend using OOP makes the code significantly cleaner, testable, and easier to scale.

*   **`RoomManager` Class**:
    *   Acts as the central registry for all active rooms.
    *   Uses a `Map` to store rooms (`O(1)` lookup).
    *   Responsible for garbage collecting empty rooms.
*   **`Room` Class**:
    *   Encapsulates all logic for a single room.
    *   Maintains the `VideoState` and a `Map` of `Participant` objects.
    *   Contains methods like `addParticipant` and `removeParticipant`, handling the internal Socket.io room (`socket.join()` / `socket.leave()`) and broadcasting updates (`user_joined`, `user_left`) directly.
    *   Handles the Host Auto-Transfer logic elegantly when a `Host` is removed.
*   **`Participant` Class**:
    *   Stores user metadata (`socket`, `id`, `username`, `role`).
    *   Provides a `toJSON()` method to safely serialize user data for broadcasting (stripping out the circular `socket` object).

## 🛡️ Role-Based Access Control (RBAC)
Role enforcement is handled securely on the **backend**. Even if a malicious user alters the frontend code to enable the video controls, the backend `server.ts` explicitly checks their role before processing `play`, `pause`, `seek`, `change_video`, `assign_role`, or `remove_participant` events. If they aren't a Host or Moderator, the event is silently ignored.
