import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

let socket = null;

export const connectSocket = (userId) => {
  socket = io(SOCKET_URL);
  socket.emit("join_room", userId);

  socket.on("session_reminder", (data) => {
    // Browser notification
    if (Notification.permission === "granted") {
      new Notification("Study Reminder 📚", { body: data.message });
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;
