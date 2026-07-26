"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugMessage, setDebugMessage] = useState("");

  async function handleLogin() {
    if (loading) return;

    const cleanEmail = email.trim();

    setErrorMessage("");
    setDebugMessage("");

    if (!cleanEmail) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);
    setDebugMessage("Connecting to Firebase...");

    try {
      try {
        await setPersistence(auth, browserLocalPersistence);
        setDebugMessage("Firebase connected. Signing in...");
      } catch (localError) {
        console.warn(
          "Local persistence unavailable. Trying session persistence.",
          localError
        );

        await setPersistence(auth, browserSessionPersistence);
        setDebugMessage("Session ready. Signing in...");
      }

      const credential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = credential.user;

      if (!user) {
        throw new Error("Firebase did not return a signed-in user.");
      }

      await user.getIdToken();

      setDebugMessage("Login successful. Opening dashboard...");

      console.log("Authenticated user:", {
        uid: user.uid,
        email: user.email,
      });

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setErrorMessage("Incorrect email or password.");
            break;

          case "auth/network-request-failed":
            setErrorMessage(
              "Your phone could not connect to Firebase."
            );
            break;

          case "auth/too-many-requests":
            setErrorMessage(
              "Too many login attempts. Please wait and try again."
            );
            break;

          case "auth/unauthorized-domain":
            setErrorMessage(
              "This device address is not authorized by Firebase."
            );
            break;

          default:
            setErrorMessage(
              `${error.code}: ${error.message}`
            );
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "An unexpected error occurred while logging in."
        );
      }

      setDebugMessage("");
    } finally {
      setLoading(false);
    }
  }

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
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          {debugMessage && (
            <div className="rounded-2xl border border-blue-500/50 bg-blue-950/30 p-4 text-blue-200">
              {debugMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-500 bg-red-950/40 p-4 text-red-300 break-words">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-pink-500 py-4 text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>
      </div>
    </main>
  );
}