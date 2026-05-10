// All room and participant state is managed in-memory via RoomManager.
// SQLite has been removed to avoid native binary compatibility issues on deployment.

export const initDb = async () => {
  console.log('Server initialized. Using in-memory state management.');
};
