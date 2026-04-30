
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "../utils/constants";

/**
 * Custom hook for Socket.io connection
 */
const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      // 🔌 Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // 🚨 IMPORTANT: Socket URL should NOT include /api
    const SOCKET_URL =
      process.env.REACT_APP_BACKEND_URL?.replace("/api", "") ||
      "https://messagetalk.onrender.com";

    // Prevent multiple connections
    if (socketRef.current) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // ✅ Connected
    newSocket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("✅ Socket connected");
      setIsConnected(true);
    });

    // ❌ Disconnected
    newSocket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    // ⚠️ Error
    newSocket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return { socket, isConnected };
};

export default useSocket;

