import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { getSocket } from '../lib/socket';

export interface Message {
    _id: string;
    senderId: string;
    text: string;
    image: string;
    video: string;
    createdAt: string;
}

export interface Conversation {
    _id: string;
    partner: {
        _id: string;
        username: string;
        email: string;
        profilePic: string;
    };
    lastMessage?: Message;
}

interface ChatState {
    users: any[];
    conversations: Conversation[];
    activeConversationUser: any | null; // Detailed user info for current chat partner
    messages: Message[];
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    isSending: boolean;

    // Actions
    getUsers: (search?: string) => Promise<void>;
    getConversations: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (userId: string, data: any) => Promise<void>;
    setActiveConversationUser: (user: any) => void;
    // Socket actions
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    users: [],
    conversations: [],
    activeConversationUser: null,
    messages: [],
    isUsersLoading: false,
    isMessagesLoading: false,
    isSending: false,

    getUsers: async (search = '') => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get(`/users/search?q=${search}`);
            set({ users: res.data });
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getConversations: async () => {
        try {
            const res = await axiosInstance.get('/messages/conversations');
            set({ conversations: res.data });
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (userId, data) => {
        set({ isSending: true });
        try {
            // data might be FormData if images/videos, or just JSON
            const res = await axiosInstance.post(`/messages/send/${userId}`, data);
            set((state) => ({ messages: [...state.messages, res.data] }));
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            set({ isSending: false });
        }
    },

    setActiveConversationUser: (user) => {
        set({ activeConversationUser: user });
    },

    subscribeToMessages: () => {
        const socket = getSocket();
        if (!socket) return;
        socket.on('newMessage', (newMessage: Message) => {
            // If we are currently chatting with the sender, add it to our array immediately.
            const { activeConversationUser, messages } = get();
            if (activeConversationUser && newMessage.senderId === activeConversationUser._id) {
                set({ messages: [...messages, newMessage] });
            }
            // Also potentially trigger fetchConversations to update the list, or do it locally
        });
    },

    unsubscribeFromMessages: () => {
        const socket = getSocket();
        if (!socket) return;
        socket.off('newMessage');
    },

    addMessage: (message) => {
        // Only add if it belongs to the active conversation
        const { activeConversationUser, messages } = get();
        if (activeConversationUser && message.senderId === activeConversationUser._id) {
            set({ messages: [...messages, message] });
        }
    }
}));
