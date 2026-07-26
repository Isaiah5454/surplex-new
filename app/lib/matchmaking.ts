import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./firebase";

const MAX_MATCH_CANDIDATES = 25;

async function tryMatchUsers(
  currentUserId: string,
  partnerId: string
): Promise<string | null> {
  const currentQueueRef = doc(db, "queue", currentUserId);
  const partnerQueueRef = doc(db, "queue", partnerId);

  const roomRef = doc(collection(db, "rooms"));

  return runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(currentQueueRef);
    const partnerSnapshot = await transaction.get(partnerQueueRef);

    if (!currentSnapshot.exists() || !partnerSnapshot.exists()) {
      return null;
    }

    const currentData = currentSnapshot.data();
    const partnerData = partnerSnapshot.data();

    const currentAvailable =
      currentData.status === "WAITING" && currentData.roomId === null;

    const partnerAvailable =
      partnerData.status === "WAITING" && partnerData.roomId === null;

    if (!currentAvailable || !partnerAvailable) {
      return null;
    }

    transaction.set(roomRef, {
      users: [currentUserId, partnerId],
      status: "ACTIVE",
      createdAt: serverTimestamp(),
    });

    transaction.update(currentQueueRef, {
      status: "MATCHED",
      roomId: roomRef.id,
    });

    transaction.update(partnerQueueRef, {
      status: "MATCHED",
      roomId: roomRef.id,
    });

    return roomRef.id;
  });
}

export async function findMatch(user: User): Promise<string | null> {
  const waitingUsersQuery = query(
    collection(db, "queue"),
    where("status", "==", "WAITING"),
    limit(MAX_MATCH_CANDIDATES)
  );

  const waitingUsersSnapshot = await getDocs(waitingUsersQuery);

  const candidateIds = waitingUsersSnapshot.docs
    .map((snapshot) => snapshot.id)
    .filter((uid) => uid !== user.uid);

  for (const partnerId of candidateIds) {
    const roomId = await tryMatchUsers(user.uid, partnerId);

    if (roomId) {
      console.log(
        `Matched ${user.uid} with ${partnerId} in room ${roomId}`
      );

      return roomId;
    }
  }

  return null;
}