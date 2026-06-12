"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "../../lib/firebase";

export default function RoomPage() {

  const params = useParams();

  const router = useRouter();

  const roomId =
    params.id as string;

  const [user, setUser] =
    useState<any>(null);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<any[]>([]);

  const [typingUser, setTypingUser] =
    useState("");

  const localVideoRef =
    useRef<HTMLVideoElement>(null);

  const remoteVideoRef =
    useRef<HTMLVideoElement>(null);

  const peerConnection =
    useRef<RTCPeerConnection | null>(
      null
    );

  const [localStream, setLocalStream] =
    useState<MediaStream | null>(
      null
    );

  const [isMuted, setIsMuted] =
    useState(false);

  const [cameraOff, setCameraOff] =
    useState(false);
 
    const [timeLeft, setTimeLeft] =
  useState(60);

const [matchEnded, setMatchEnded] =
  useState(false);

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
        ],
      },
    ],
  };

  // AUTH
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          if (currentUser) {

            setUser(currentUser);

          } else {

            router.push("/login");

          }

        }
      );

    return () => unsubscribe();

  }, [router]);

  // START CAMERA + MIC
  useEffect(() => {

    const startVideo =
      async () => {

        try {

          const stream =
            await navigator
              .mediaDevices
              .getUserMedia({
                video: true,
                audio: true,
              });

          setLocalStream(stream);

          if (
            localVideoRef.current
          ) {

            localVideoRef.current.srcObject =
              stream;

          }

          const pc =
            new RTCPeerConnection(
              servers
            );

          peerConnection.current =
            pc;

          // ADD LOCAL TRACKS
          stream
            .getTracks()
            .forEach((track) => {

              pc.addTrack(
                track,
                stream
              );

            });

          // REMOTE STREAM
          pc.ontrack =
            (event) => {

              const remoteStream =
                event.streams[0];

              if (
                remoteVideoRef.current
              ) {

                remoteVideoRef.current.srcObject =
                  remoteStream;

              }

            };

        } catch (error) {

          console.error(
            error
          );

        }

      };

    if (roomId) {

      startVideo();

    }

  }, [roomId]);

useEffect(() => {

  if (timeLeft <= 0) {

    setMatchEnded(true);

    setTimeout(() => {

      router.push("/speedchat");

    }, 3000);

    return;

  }

  const timer =
    setInterval(() => {

      setTimeLeft(
        (prev) => prev - 1
      );

    }, 1000);

  return () =>
    clearInterval(timer);

}, [timeLeft, router]);

// MESSAGES

  // MESSAGES
  useEffect(() => {

    if (!roomId || !user)
      return;

    const q = query(
      collection(
        db,
        "rooms",
        roomId,
        "messages"
      ),
      orderBy(
        "createdAt",
        "asc"
      )
    );

    const unsubscribe =
      onSnapshot(
        q,
        async (snapshot) => {

          const messageData =
            snapshot.docs.map(
              (docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })
            );

          setMessages(
            messageData
          );

        }
      );

    return () => unsubscribe();

  }, [roomId, user]);

  // TYPING LISTENER
  useEffect(() => {

    if (!roomId || !user)
      return;

    const roomRef =
      doc(
        db,
        "rooms",
        roomId
      );

    const unsubscribe =
      onSnapshot(
        roomRef,
        (snapshot) => {

          const data =
            snapshot.data();

          if (
            data?.typing
          ) {

            const typingUsers =
              Object.entries(
                data.typing
              );

            const otherTyping =
              typingUsers.find(
                ([uid, value]) =>
                  uid !==
                    user.uid &&
                  value === true
              );

            if (
              otherTyping
            ) {

              setTypingUser(
                "Someone is typing..."
              );

            } else {

              setTypingUser("");

            }

          }

        }
      );

    return () => unsubscribe();

  }, [roomId, user]);

  const updateTyping =
    async (
      isTyping: boolean
    ) => {

      if (!user) return;

      const roomRef =
        doc(
          db,
          "rooms",
          roomId
        );

      await updateDoc(
        roomRef,
        {
          [`typing.${user.uid}`]:
            isTyping,
        }
      );

    };

  const handleSend =
    async () => {

      if (
        !message.trim()
      ) return;

      if (!user) return;

      await addDoc(
        collection(
          db,
          "rooms",
          roomId,
          "messages"
        ),
        {
          text: message,
          uid: user.uid,
          email: user.email,
          read: false,
          createdAt:
            serverTimestamp(),
        }
      );

      await updateTyping(
        false
      );

      setMessage("");

    };

  // LEAVE ROOM
  const handleLeave =
    async () => {

      if (localStream) {

        localStream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

      }

      if (
        peerConnection.current
      ) {

        peerConnection.current.close();

      }

      router.push(
        "/dashboard"
      );

    };

  // MUTE
  const toggleMute = () => {

    if (!localStream) return;

    localStream
      .getAudioTracks()
      .forEach((track) => {

        track.enabled =
          !track.enabled;

        setIsMuted(
          !track.enabled
        );

      });

  };

  // CAMERA TOGGLE
  const toggleCamera = () => {

    if (!localStream) return;

    localStream
      .getVideoTracks()
      .forEach((track) => {

        track.enabled =
          !track.enabled;

        setCameraOff(
          !track.enabled
        );

      });

  };

  return (
<main className="min-h-screen bg-black text-white flex flex-col">

    <div className="text-center py-4">
      <h2 className="text-5xl font-bold text-pink-500">
        {String(Math.floor(timeLeft / 60)).padStart(2, "0")}
        :
        {String(timeLeft % 60).padStart(2, "0")}
      </h2>
    </div>

 {/* TOP CONTROLS */}

<div className="p-4 flex gap-4 justify-end flex-wrap">

  <button
    onClick={toggleMute}
    className="bg-yellow-500 px-6 py-3 rounded-2xl font-bold"
  >
    {isMuted
      ? "Unmute"
      : "Mute"}
  </button>

  <button
    onClick={toggleCamera}
    className="bg-blue-500 px-6 py-3 rounded-2xl font-bold"
  >
    {cameraOff
      ? "Turn Camera On"
      : "Turn Camera Off"}
  </button>

  <button
    onClick={handleLeave}
    className="bg-red-500 px-6 py-3 rounded-2xl font-bold"
  >
    Leave
  </button>

</div>

      {/* VIDEO */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">

        {/* LOCAL VIDEO */}

        <div className="bg-[#111118] rounded-2xl overflow-hidden border border-gray-700">

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[300px] object-cover"
          />

          <div className="p-3 text-center text-gray-400">
            You
          </div>

        </div>

        {/* REMOTE VIDEO */}

        <div className="bg-[#111118] rounded-2xl overflow-hidden border border-gray-700">

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-[300px] object-cover"
          />

          <div className="p-3 text-center text-gray-400">
            Stranger
          </div>

        </div>

      </div>

      {/* CHAT */}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">

        {messages.map(
          (msg) => (

            <div
              key={msg.id}
              className="bg-[#111118] border border-gray-700 rounded-2xl p-4"
            >

              <p className="text-sm text-gray-400 mb-2">
                {msg.email}
              </p>

              <p className="text-lg">
                {msg.text}
              </p>

            </div>

          )
        )}

        {typingUser && (

          <div className="text-gray-400 italic px-2">
            {typingUser}
          </div>

        )}

      </div>

      {/* INPUT */}

      <div className="border-t border-gray-800 p-5 flex gap-4 fixed bottom-0 left-0 w-full bg-black">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={async (e) => {

            setMessage(
              e.target.value
            );

            await updateTyping(
              e.target.value
                .length > 0
            );

          }}
          className="flex-1 rounded-2xl border border-gray-700 bg-[#111118] p-4 text-white outline-none"
        />

        <button
          onClick={handleSend}
          className="rounded-2xl bg-pink-500 px-8 text-xl font-bold"
        >
          Send
        </button>

      </div>

    </main>
  );
}