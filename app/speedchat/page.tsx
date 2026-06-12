"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../lib/firebase";

export default function SpeedChatPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("Ready to meet someone.");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // LISTEN FOR ROOM MATCHES
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, "rooms"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.users.includes(currentUser.uid)) {
          setSearching(false);
          setStatus("Match Found!");

          router.push(`/room/${docSnap.id}`);
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser, router]);

  // START CHAT
  const handleStartChat = async () => {
    if (!currentUser) return;

    setLoading(true);
    setSearching(true);
    setStatus("Looking for someone...");

    const queueSnapshot = await getDocs(collection(db, "queue"));

    const usersInQueue = queueSnapshot.docs.filter(
      (docSnap) => docSnap.id !== currentUser.uid
    );

    // MATCH FOUND
    if (usersInQueue.length > 0) {
      const matchedUser = usersInQueue[0];

      const roomId = crypto.randomUUID();

      await setDoc(doc(db, "rooms", roomId), {
        users: [currentUser.uid, matchedUser.id],
        createdAt: serverTimestamp(),
      });

      await deleteDoc(doc(db, "queue", matchedUser.id));
      await deleteDoc(doc(db, "queue", currentUser.uid));
    } else {
      // ENTER QUEUE
      await setDoc(doc(db, "queue", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        joinedAt: serverTimestamp(),
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-[#050510] border border-gray-800 rounded-3xl p-10 text-center shadow-2xl">

        <h1 className="text-6xl font-bold mb-6">
          Surplex
        </h1>

        <p className="text-gray-400 text-xl mb-10">
          Meet random people instantly.
        </p>

        {!searching ? (
          <button
            onClick={handleStartChat}
            disabled={loading}
            className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 transition py-5 text-2xl font-bold"
          >
            {loading ? "Loading..." : "Start Speed Chat"}
          </button>
        ) : (
          <div className="space-y-8">

            <div>
              <h2 className="text-4xl font-bold text-pink-500 animate-pulse">
                🔍 Searching...
              </h2>

              <p className="text-gray-400 mt-4 text-lg">
                {status}
              </p>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full w-2/3 bg-pink-500 animate-pulse"></div>
            </div>

            <p className="text-gray-500">
              Please wait while we find another user...
            </p>

          </div>
        )}

      </div>
    </main>
  );
}