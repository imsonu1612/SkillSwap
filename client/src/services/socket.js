import { io } from 'socket.io-client';

let socketInstance = null;

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }

  return undefined;
};

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: false,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('token')
      }
    });
  }

  socketInstance.auth = {
    token: localStorage.getItem('token')
  };

  return socketInstance;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
