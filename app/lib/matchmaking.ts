import { User } from "firebase/auth";

// ------------------------------
// Join Queue
// ------------------------------
export async function joinQueue(user: User): Promise<void> {
  console.log(`${user.uid} joined the queue`);
}

// ------------------------------
// Leave Queue
// ------------------------------
export async function leaveQueue(uid: string): Promise<void> {
  console.log(`${uid} left the queue`);
}

// ------------------------------
// Find Waiting User
// ------------------------------
async function findWaitingUser(): Promise<string | null> {
  return null;
}

// ------------------------------
// Create Room
// ------------------------------
async function createRoom(
  user1: string,
  user2: string
): Promise<string> {
  console.log(`Creating room for ${user1} and ${user2}`);

  return crypto.randomUUID();
}

// ------------------------------
// Match Users
// ------------------------------
async function matchUsers(
  user: User
): Promise<string | null> {
  await joinQueue(user);

  const partner = await findWaitingUser();

  if (!partner) {
    return null;
  }

  return await createRoom(user.uid, partner);
}

// ------------------------------
// Public API
// ------------------------------
export async function findMatch(
  user: User
): Promise<string | null> {
  return await matchUsers(user);
}