"use client";

type MatchmakingCardProps = {
  loading: boolean;
  searching: boolean;
  status: string;
  onStart: () => void;
  onCancel: () => void;
};

export default function MatchmakingCard({
  loading,
  searching,
  status,
  onStart,
  onCancel,
}: MatchmakingCardProps) {
  return (
    <div className="w-full max-w-2xl bg-[#050510] border border-gray-800 rounded-3xl p-10 text-center shadow-2xl">

      <h1 className="text-6xl font-bold mb-6 text-white">
        Surplex
      </h1>

      <p className="text-gray-400 text-xl mb-10">
        Meet random people instantly.
      </p>

      {!searching ? (
        <button
          onClick={onStart}
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

            <p className="text-gray-400 mt-3">
              {status}
            </p>

          </div>

          <div className="w-full h-3 rounded-full bg-gray-800 rounded-full overflow-hidden">

            <div className="h-full w-2/3 bg-pink-500 animate-pulse"></div>

          </div>

          <button
            onClick={onCancel}
            className="w-full rounded-2xl bg-red-500 hover:bg-red-600 py-4 text-xl font-bold transition"
          >
            Cancel Search
          </button>

        </div>
      )}

    </div>
  );
}