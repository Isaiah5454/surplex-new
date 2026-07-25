import { User } from "firebase/auth";
import {
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  onSnapshot,
  DocumentData,
  Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";

export interface QueueEntry {
  uid: string;
  status: "WAITING" | "MATCHED";
  roomId: string | null;
  joinedAt: unknown;
}

export async function joinQueue(user: User): Promise<void> {
  const queueRef = doc(db, "queue", user.uid);

  await setDoc(queueRef, {
    uid: user.uid,
    status: "WAITING",
    roomId: null,
    joinedAt: serverTimestamp(),
  });

  console.log(`${user.uid} joined the queue`);
}

export async function leaveQueue(uid: string): Promise<void> {
  await deleteDoc(doc(db, "queue", uid));

  console.log(`${uid} left the queue`);
}

export function watchQueue(
  uid: string,
  callback: (data: DocumentData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "queue", uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.data());
  });
}