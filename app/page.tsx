import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Surplex
        </h1>

        <p className="text-2xl text-gray-300 mb-12">
          Meet new people instantly through random video chat.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/login"
            className="px-10 py-5 rounded-2xl bg-pink-600 hover:bg-pink-700 transition text-xl font-bold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="px-10 py-5 rounded-2xl border border-gray-600 hover:border-pink-500 hover:bg-pink-500/10 transition text-xl font-bold"
          >
            Sign Up
          </Link>

          <Link
            href="/speedchat"
            className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-xl font-bold"
          >
            Start Chat
          </Link>
        </div>

        <div className="mt-20 text-gray-500 text-lg">
          Random video chat • Real people • Instant matching
        </div>
      </div>
    </main>
  );
}