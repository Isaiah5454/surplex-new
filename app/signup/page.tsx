"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    setErrorMessage("");

    if (!cleanUsername) {
      setErrorMessage("Please enter a username.");
      return;
    }

    if (!cleanEmail) {
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: cleanUsername,
        bio: "",
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setErrorMessage(
              "That email already has a Surplex account. Try logging in instead."
            );
            break;

          case "auth/invalid-email":
            setErrorMessage("Please enter a valid email address.");
            break;

          case "auth/weak-password":
            setErrorMessage(
              "Your password is too weak. Please choose a stronger password."
            );
            break;

          case "auth/network-request-failed":
            setErrorMessage(
              "Surplex could not reach Firebase. Check your connection and try again."
            );
            break;

          case "auth/operation-not-allowed":
            setErrorMessage(
              "Email and password signup is not enabled in Firebase."
            );
            break;

          default:
            setErrorMessage(`${error.code}: ${error.message}`);
        }

        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

        <form onSubmit={handleSignup} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
            className="w-full rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
          />

          {errorMessage && (
            <div className="rounded-2xl border border-red-500 bg-red-950/40 p-4 text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-pink-500 py-4 text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </main>
  );
}