import { useEffect, useRef } from 'react';
import { MoreVertical, Phone, Search, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const ChatArea = () => {
    const { user, onlineUsers } = useAuthStore();
    const {
        messages,
        activeConversationUser,
        getMessages,
        sendMessage,
        isMessagesLoading,
        subscribeToMessages,
        unsubscribeFromMessages
    } = useChatStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeConversationUser) {
            getMessages(activeConversationUser._id);
        }
    }, [activeConversationUser?._id, getMessages]);

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (text: string) => {
        if (!activeConversationUser) return;
        sendMessage(activeConversationUser._id, { text });
    };

    if (!activeConversationUser) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0e1621] bg-[url('https://web.telechat.org/a/chat-bg-pattern-dark.png')] bg-repeat bg-[length:400px]">
                <div className="bg-tg-dark/80 px-4 py-2 rounded-full text-white/90 font-medium shadow-sm backdrop-blur-md">
                    Select a chat to start messaging
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative bg-[#0e1621] bg-[url('https://web.telechat.org/a/chat-bg-pattern-dark.png')] bg-repeat bg-[length:400px]">
            {/* Header */}
            <div className="h-[56px] px-4 border-b border-[#0e1621] flex items-center justify-between bg-tg-dark/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
                {/* User Info */}
                <div className="flex items-center gap-3 cursor-pointer">
                    {activeConversationUser.profilePic ? (
                        <img src={activeConversationUser.profilePic} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-[17px] uppercase">
                            {activeConversationUser.username.charAt(0)}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-white font-medium text-[15px] leading-tight">
                            {activeConversationUser.username}
                        </h2>
                        {/* Status (stub) */}
                        <p className="text-[13px] text-tg-badge leading-tight mt-[2px]">
                            {onlineUsers.includes(activeConversationUser._id) ? 'online' : 'offline'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 text-tg-muted">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-tg-hover transition-colors">
                        <Search size={20} strokeWidth={2} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-tg-hover transition-colors">
                        <Phone size={20} strokeWidth={2} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-tg-hover transition-colors ml-1">
                        <MoreVertical size={20} className="text-tg-muted" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 custom-scrollbar flex flex-col pt-4 pb-2">
                {isMessagesLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-tg-muted w-8 h-8" />
                    </div>
                ) : (
                    <div className="w-full flex flex-col flex-1 justify-end">
                        {messages.length === 0 ? (
                            <div className="flex justify-center mb-4">
                                <span className="bg-tg-dark/40 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[13px] font-medium text-white/90">
                                    Conversation started
                                </span>
                            </div>
                        ) : null}

                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg._id}
                                id={msg._id}
                                senderId={msg.senderId}
                                text={msg.text}
                                timestamp={new Date(msg.createdAt)}
                                isOwnMsg={msg.senderId === user?._id}
                            />
                        ))}
                    </div>
                )}
                <div ref={bottomRef} className="h-1 w-full shrink-0" />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 w-full z-10 px-4 pb-4">
                <div className="w-full relative">
                    <MessageInput onSendMessage={handleSendMessage} />
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
