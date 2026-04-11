import { io } from 'socket.io-client';

let socketInstance = null;

const isSocketEnabled = () => {
  if (process.env.REACT_APP_ENABLE_SOCKET === 'true') {
    return true;
  }

  if (process.env.REACT_APP_ENABLE_SOCKET === 'false') {
    return false;
  }

  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return Boolean(process.env.REACT_APP_SOCKET_URL);
};

const getSocketUrl = () => {
  console.log('[Socket.URL Debug] REACT_APP_SOCKET_URL:', process.env.REACT_APP_SOCKET_URL);
  console.log('[Socket.URL Debug] NODE_ENV:', process.env.NODE_ENV);
  
  // Only use explicit socket URL config
  if (process.env.REACT_APP_SOCKET_URL) {
    console.log('[Socket.URL Debug] Using REACT_APP_SOCKET_URL');
    return process.env.REACT_APP_SOCKET_URL;
  }

  // Dev: default to backend server
  if (process.env.NODE_ENV === 'development') {
    console.log('[Socket.URL Debug] Returning localhost:5000 (dev default)');
    return 'http://localhost:5000';
  }

  // Prod without socket config: disable sockets
  console.log('[Socket.URL Debug] Returning null (prod without socket config)');
  return null;
};

export const getSocket = () => {
  if (!isSocketEnabled()) {
    return null;
  }

  if (!socketInstance) {
    const socketUrl = getSocketUrl();
    console.log('[Socket] Initializing with URL:', socketUrl, 'NODE_ENV:', process.env.NODE_ENV);
    
    socketInstance = io(socketUrl, {
      autoConnect: false,
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 2,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketInstance.on('connect_error', (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Socket] Connection attempt failed (OK if not in chat):', error?.message);
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
  if (!socket) {
    return null;
  }

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
