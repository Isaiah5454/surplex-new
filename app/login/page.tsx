"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Login successful!");

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
            Welcome Back
          </h1>

          <p className="text-gray-400 text-xl">
            Login to Surplex.
          </p>
        </div>

        <div className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-2xl bg-pink-500 py-4 text-xl font-bold text-white"
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}