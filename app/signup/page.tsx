"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      // CREATE AUTH USER
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // CREATE FIRESTORE USER PROFILE
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        bio: "Bio: Building the future of Surplex.",
        createdAt: serverTimestamp(),
      });

      alert("Account created successfully!");

      router.push("/dashboard");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-[#050510] border border-gray-800 rounded-3xl p-10">

        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-white mb-4">
            Join Surplex
          </h1>

          <p className="text-gray-400 text-xl">
            Create your experience.
          </p>
        </div>

        <div className="space-y-6">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <button
            onClick={handleSignup}
            className="w-full rounded-2xl bg-pink-500 py-4 text-xl font-bold text-white"
          >
            Create Account
          </button>

        </div>
      </div>
    </main>
  );
}