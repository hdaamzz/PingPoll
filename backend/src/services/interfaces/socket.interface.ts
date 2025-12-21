import { Socket } from "socket.io";

export interface UserSocket extends Socket {
  userId?: string;
  userName?: string;
  userPicture?: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  userPicture: string;
}