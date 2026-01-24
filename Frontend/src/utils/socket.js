
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // Manually connect later
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
});