import { Room } from './Room';

export class RoomManager {
  public rooms: Map<string, Room> = new Map();

  public getOrCreateRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    return this.rooms.get(roomId)!;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public removeRoom(roomId: string) {
    this.rooms.delete(roomId);
  }
}
