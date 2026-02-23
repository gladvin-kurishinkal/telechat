import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { initiateSocketConnection, disconnectSocket } from '../lib/socket';

export interface User {
    _id: string;
    username: string;
    email: string;
    profilePic: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];

    // Actions
    register: (userData: any) => Promise<void>;
    login: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>; // Call on app load to restore session
    setOnlineUsers: (users: string[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('chat-token') || null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true, // true by default when app loads
    onlineUsers: [],

    setOnlineUsers: (users) => set({ onlineUsers: users }),

    checkAuth: async () => {
        try {
            set({ isCheckingAuth: true });
            const token = localStorage.getItem('chat-token');

            if (!token) {
                set({ user: null, isAuthenticated: false, isCheckingAuth: false });
                return;
            }

            // Check with backend
            const res = await axiosInstance.get('/auth/me');

            initiateSocketConnection(res.data._id);
            set({ user: res.data, isAuthenticated: true, isCheckingAuth: false });
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('chat-token');
            disconnectSocket();
            set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false, onlineUsers: [] });
        }
    },

    register: async (userData) => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.post('/auth/register', userData);

            const { token, ...user } = res.data;
            localStorage.setItem('chat-token', token);

            initiateSocketConnection(user._id);
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw error.response?.data?.message || 'Registration failed';
        }
    },

    login: async (userData) => {
        try {
            set({ isLoading: true });
            const res = await axiosInstance.post('/auth/login', userData);

            const { token, ...user } = res.data;
            localStorage.setItem('chat-token', token);

            initiateSocketConnection(user._id);
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw error.response?.data?.message || 'Login failed';
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('chat-token');
            disconnectSocket();
            set({ user: null, token: null, isAuthenticated: false, isLoading: false, onlineUsers: [] });
        }
    }
}));
