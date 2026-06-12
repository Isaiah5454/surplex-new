"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../lib/firebase";

interface UserProfile {
  id: string;
  username: string;
  bio: string;
 email: string;
  photoURL?: string;
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));

      const usersData: UserProfile[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<UserProfile, "id">),
      }));

      setUsers(usersData);
    };

    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-7xl font-bold mb-4 text-center">
          Discover
        </h1>

        <p className="text-gray-400 text-center mb-16 text-xl">
          Explore Surplex users.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 hover:border-pink-500 transition"
            >
              <img
                src={
                  user.photoURL ||
                  "/uploads/IMG_1422.JPG"
                }
                alt="profile"
                className="w-28 h-28 rounded-full object-cover mb-6 border-4 border-pink-500"
              />

              <h2 className="text-4xl font-bold mb-4">
                {user.username}
              </h2>

              <p className="text-gray-300 mb-6 text-lg">
                {user.bio}
              </p>

              <p className="text-gray-500">
                {user.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}