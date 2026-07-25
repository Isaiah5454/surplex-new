import { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

// ------------------------------
// Join the matchmaking queue
// ------------------------------
export async function joinQueue(user: User): Promise<void> {
  await setDoc(doc(db, "queue", user.uid), {
    uid: user.uid,
    status: "WAITING",
    roomId: null,
    joinedAt: serverTimestamp(),
  });
}

// ------------------------------
// Leave the matchmaking queue
// ------------------------------
export async function leaveQueue(uid: string): Promise<void> {
  await deleteDoc(doc(db, "queue", uid));
}

// ------------------------------
// Find someone waiting
// ------------------------------
async function findWaitingUser(user: User) {
  const waitingQuery = query(
    collection(db, "queue"),
    where("status", "==", "WAITING")
  );

  const snapshot = await getDocs(waitingQuery);

  return snapshot.docs.find((doc) => doc.id !== user.uid) ?? null;
}

// ------------------------------
// Create room
// ------------------------------
async function createRoom(user1: string, user2: string): Promise<string> {
  const roomRef = doc(collection(db, "rooms"));

  await setDoc(roomRef, {
    users: [user1, user2],
    status: "ACTIVE",
    createdAt: serverTimestamp(),
  });

  return roomRef.id;
}

// ------------------------------
// Main matchmaking engine
// ------------------------------
async function matchUsers(user: User): Promise<string | null> {
  // Put current user in queue
  await joinQueue(user);

  // Look for another waiting user
  const partner = await findWaitingUser(user);

  // Nobody yet
  if (!partner) {
    return null;
  }

  // Create room
  const roomId = await createRoom(user.uid, partner.id);

  // Update partner
  await updateDoc(doc(db, "queue", partner.id), {
    status: "MATCHED",
    roomId,
  });

  // Update yourself
  await updateDoc(doc(db, "queue", user.uid), {
    status: "MATCHED",
    roomId,
  });

  return roomId;
}

// ------------------------------
// Public function
// ------------------------------
export async function findMatch(
  user: User
): Promise<string | null> {
  return await matchUsers(user);
}