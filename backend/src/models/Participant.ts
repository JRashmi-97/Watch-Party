import { Socket } from 'socket.io';

export type Role = 'Host' | 'Moderator' | 'Participant';

export class Participant {
  constructor(
    public socket: Socket,
    public id: string,
    public username: string,
    public role: Role
  ) {}

  public toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role
    };
  }
}
