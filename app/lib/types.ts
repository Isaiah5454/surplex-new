// =========================
// USER
// =========================

export type AgeRange =
  | "18-24"
  | "25-34"
  | "35-44"
  | "45+";

export interface UserProfile {
  uid: string;
  username: string;
  ageRange: AgeRange;
  country: string;
  interests: string[];
  verified: boolean;
  ghostMode: boolean;
  online: boolean;
  createdAt: Date;
}

// =========================
// QUEUE
// =========================

export type QueueStatus =
  | "WAITING"
  | "MATCHING"
  | "MATCHED"
  | "CONNECTED"
  | "LEFT";

export interface QueueUser {
  uid: string;
  status: QueueStatus;
  roomId: string | null;
  joinedAt: Date;
}

// =========================
// ROOM
// =========================

export type RoomStatus =
  | "CREATED"
  | "CONNECTING"
  | "ACTIVE"
  | "ENDED";

export interface Room {
  id: string;
  users: string[];
  status: RoomStatus;
  createdAt: Date;
  expiresAt: Date;
}