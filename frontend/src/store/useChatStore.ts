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
    unreadCount?: number;
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
            const newMessage = res.data;

            set((state) => {
                const updatedConversations = [...state.conversations];
                const convIndex = updatedConversations.findIndex(c => c.partner._id === userId);

                if (convIndex !== -1) {
                    const conv = { ...updatedConversations[convIndex], lastMessage: newMessage };
                    updatedConversations.splice(convIndex, 1);
                    updatedConversations.unshift(conv);
                }

                return {
                    messages: [...state.messages, newMessage],
                    conversations: updatedConversations
                };
            });

            // Sync conversations in background to get real conversation ID if it was temporary
            get().getConversations();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            set({ isSending: false });
        }
    },

    setActiveConversationUser: (user) => {
        const { conversations } = get();

        let exists = false;
        const updatedConversations = conversations.map(c => {
            if (c.partner._id === user._id) {
                exists = true;
                return { ...c, unreadCount: 0 };
            }
            return c;
        });

        if (!exists) {
            updatedConversations.unshift({
                _id: `temp_${user._id}`,
                partner: user,
            });
        }

        set({
            activeConversationUser: user,
            conversations: updatedConversations
        });
    },

    subscribeToMessages: () => {
        const socket = getSocket();
        if (!socket) return;
        socket.on('newMessage', (newMessage: Message) => {
            const { activeConversationUser, messages, conversations, getConversations } = get();

            const isActive = activeConversationUser && newMessage.senderId === activeConversationUser._id;

            if (isActive) {
                set({ messages: [...messages, newMessage] });
            }

            // Update conversations list locally
            const updatedConversations = [...conversations];
            const convIndex = updatedConversations.findIndex(
                c => c.partner._id === newMessage.senderId
            );

            if (convIndex !== -1) {
                const conv = { ...updatedConversations[convIndex] };
                conv.lastMessage = newMessage;
                if (!isActive) {
                    conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
                updatedConversations.splice(convIndex, 1);
                updatedConversations.unshift(conv);
                set({ conversations: updatedConversations });
            } else {
                getConversations();
            }
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
