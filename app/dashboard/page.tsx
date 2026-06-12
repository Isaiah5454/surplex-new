"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [email, setEmail] =
    useState("");

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (user) {

            const docRef =
              doc(
                db,
                "users",
                user.uid
              );

            const docSnap =
              await getDoc(docRef);

            if (
              docSnap.exists()
            ) {

              const data =
                docSnap.data();

              setUsername(
                data.username
              );

              setBio(
                data.bio
              );

              setEmail(
                data.email
              );

            }

          } else {

            router.push(
              "/login"
            );

          }

        }
      );

    return () =>
      unsubscribe();

  }, [router]);

  const handleLogout =
    async () => {

      try {

        await signOut(auth);

        alert(
          "Logged out!"
        );

        router.push(
          "/login"
        );

      } catch (
        error: any
      ) {

        alert(
          error.message
        );

      }

    };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-2xl bg-[#050510] border border-gray-800 rounded-3xl p-10">

        <h1 className="text-5xl font-bold mb-6">
          Welcome to Surplex
        </h1>

        <div className="space-y-5">

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">

            <p className="text-gray-400 mb-2">
              Username
            </p>

            <p className="text-xl">
              {username}
            </p>

          </div>

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">

            <p className="text-gray-400 mb-2">
              Email
            </p>

            <p className="text-xl">
              {email}
            </p>

          </div>

          <div className="bg-[#111118] border border-gray-700 rounded-2xl p-5">

            <p className="text-gray-400 mb-2">
              Bio
            </p>

            <p className="text-xl">
              {bio}
            </p>

          </div>

        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-10 rounded-2xl bg-pink-500 py-4 text-xl font-bold"
        >
          Logout
        </button>

        <button
          onClick={() =>
            router.push(
              "/speedchat"
            )
          }
          className="w-full mt-5 rounded-2xl bg-blue-500 py-4 text-xl font-bold"
        >
          Start Speed Chat
        </button>

      </div>

    </main>
  );
}