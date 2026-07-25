"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { User, onAuthStateChanged } from "firebase/auth";

import { auth } from "../lib/firebase";
import { findMatch } from "../lib/matchmaking";
import { joinQueue, leaveQueue, watchQueue } from "../lib/queue";

export default function SpeedChatPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("Ready to meet someone.");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);
    });

    return unsubscribe;
  }, [router]);

  async function handleStartChat() {
    if (!currentUser) return;

    try {
      setLoading(true);
      setSearching(true);
      setStatus("Joining queue...");

      await joinQueue(currentUser);

      setStatus("Looking for someone...");

      watchQueue(currentUser.uid, (data) => {
        if (!data) return;

        if (data.roomId) {
          router.push(`/room/${data.roomId}`);
        }
      });

      await findMatch(currentUser);

      setLoading(false);
      setStatus("Waiting for another user...");
    } catch (error) {
      console.error(error);

      setSearching(false);
      setLoading(false);
      setStatus("Something went wrong.");
    }
  }

  async function handleCancel() {
    if (!currentUser) return;

    await leaveQueue(currentUser.uid);

    setSearching(false);
    setLoading(false);
    setStatus("Ready to meet someone.");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-[#050510] border border-gray-800 rounded-3xl p-10 text-center shadow-2xl">
        <h1 className="text-6xl font-bold mb-6">Surplex</h1>

        <p className="text-gray-400 text-xl mb-10">
          Meet random people instantly.
        </p>

        {!searching ? (
          <button
            onClick={handleStartChat}
            disabled={loading}
            className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 py-5 text-2xl font-bold"
          >
            {loading ? "Loading..." : "Start Speed Chat"}
          </button>
        ) : (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-pink-500 animate-pulse">
              🔍 Searching...
            </h2>

            <p className="text-xl text-gray-400">{status}</p>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-pink-500 animate-pulse"></div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full rounded-2xl bg-red-500 hover:bg-red-600 py-4 text-xl font-bold"
            >
              Cancel Search
            </button>
          </div>
        )}
      </div>
    </main>
  );
}