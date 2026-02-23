import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket: Socket | null = null;

export const initiateSocketConnection = (userId: string) => {
    if (!socket) {
        socket = io(URL, {
            query: { userId },
            autoConnect: true,
            transports: ['websocket'],
        });

        socket.on('getOnlineUsers', (users: string[]) => {
            useAuthStore.getState().setOnlineUsers(users);
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connect_error:', err);
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
