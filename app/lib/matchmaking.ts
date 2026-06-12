import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export async function findMatch(user: any) {
  if (!user) return null;

  // Get everyone currently waiting
  const queueSnapshot = await getDocs(collection(db, "queue"));

  // Remove yourself from the list
  const waitingUsers = queueSnapshot.docs.filter(
    (docSnap) => docSnap.id !== user.uid
  );

  // Nobody is waiting
  if (waitingUsers.length === 0) {
    await setDoc(doc(db, "queue", user.uid), {
      uid: user.uid,
      email: user.email,
      joinedAt: serverTimestamp(),
    });

    return null;
  }

  // Match with the first waiting user
  const partner = waitingUsers[0];

  // Create room
  const roomId = crypto.randomUUID();

  await setDoc(doc(db, "rooms", roomId), {
    users: [user.uid, partner.id],
    createdAt: serverTimestamp(),
  });

  // Remove both users from queue
  await deleteDoc(doc(db, "queue", partner.id));
  await deleteDoc(doc(db, "queue", user.uid));

  return roomId;
}