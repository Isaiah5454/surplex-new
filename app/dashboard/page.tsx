"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      setCurrentUser(user);

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const data = userSnapshot.data();

          setUsername(data.username ?? "");
          setBio(data.bio ?? "");
        } else {
          setUsername("");
          setBio("");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);

        setErrorMessage(
          "You are logged in, but your profile could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  async function handleLogout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setErrorMessage("Unable to log out. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Surplex
          </h1>

          <p className="text-gray-400">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-[#050510] border border-gray-800 rounded-3xl p-10">

        <h1 className="text-5xl font-bold mb-3">
          Welcome to Surplex
        </h1>

        <p className="text-gray-400 mb-8">
          You're logged in and ready to connect.
        </p>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500 bg-red-950/40 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 mb-2">
              Username
            </p>

            <p className="text-xl">
              {username || "Surplex User"}
            </p>
          </div>

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 mb-2">
              Email
            </p>

            <p className="text-xl break-all">
              {currentUser.email ?? "No email available"}
            </p>
          </div>

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">
            <p className="text-gray-400 mb-2">
              Bio
            </p>

            <p className="text-xl">
              {bio || "No bio yet."}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => router.push("/speedchat")}
          className="w-full mt-10 rounded-2xl bg-pink-500 hover:bg-pink-600 py-4 text-xl font-bold"
        >
          Start Speed Chat
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full mt-4 rounded-2xl border border-gray-700 bg-[#111118] hover:bg-[#181820] py-4 text-xl font-bold"
        >
          Logout
        </button>

      </div>
    </main>
  );
}