import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { onlineUsers } = useAuthStore();
    const {
        conversations,
        users,
        getConversations,
        getUsers,
        activeConversationUser,
        setActiveConversationUser
    } = useChatStore();

    useEffect(() => {
        getConversations();
    }, [getConversations]);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const timeout = setTimeout(() => {
                getUsers(searchQuery);
            }, 500); // Debounce search
            return () => clearTimeout(timeout);
        }
    }, [searchQuery, getUsers]);

    // If searching, show search results (users). Otherwise show existing conversations.
    const displayList = searchQuery.length > 0 ? users : conversations;

    const handleSelectChat = (item: any) => {
        // If it's a conversation object, the user is in `.partner`
        // If it's a raw user object from search, the user IS the item
        const userToChatWith = item.partner || item;
        setActiveConversationUser(userToChatWith);
        setSearchQuery(''); // clear search when selected
    };

    return (
        <div className="w-[320px] flex flex-col bg-tg-dark border-r border-[#0e1621] shrink-0 h-full">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-muted" size={18} />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-tg-panel border border-transparent rounded-full py-2 pl-10 pr-4 text-[15px] text-tg-text outline-none focus:border-tg-badge focus:bg-tg-dark transition-colors placeholder:text-tg-muted shadow-sm"
                    />
                </div>
            </div>

            {/* Conversations / Search List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
                {displayList.map((item: any) => {
                    const user = item.partner || item;
                    const isActive = activeConversationUser?._id === user._id;

                    return (
                        <div
                            key={item._id}
                            onClick={() => handleSelectChat(item)}
                            className={`flex items-center gap-3 p-2.5 rounded-[12px] cursor-pointer transition-colors ${isActive ? 'bg-tg-blue' : 'hover:bg-tg-hover'}`}
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt={user.username} className="w-[50px] h-[50px] rounded-full object-cover" />
                                ) : (
                                    <div className={`w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-medium text-lg bg-pink-500`}>
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                {/* Status indicator stub */}
                                {onlineUsers.includes(user._id) && (
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[2.5px] rounded-full ${isActive ? 'border-tg-blue' : 'border-tg-dark'}`}></div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className={`font-medium text-[15px] truncate ${isActive ? 'text-white' : 'text-tg-text'}`}>
                                        {user.username}
                                    </span>
                                    {item.lastMessage && (
                                        <span className={`text-[13px] shrink-0 ml-2 ${isActive ? 'text-white/80' : 'text-tg-muted'}`}>
                                            {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center gap-2 mt-0.5">
                                    <span className={`text-[14px] truncate ${isActive ? 'text-white/90' : 'text-tg-muted'}`}>
                                        {item.lastMessage ? item.lastMessage.text || '📷 Media' : user.email}
                                    </span>
                                    {item.unreadCount > 0 && !isActive && (
                                        <div className="bg-[#3390ec] text-white text-[12px] font-medium px-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center shrink-0">
                                            {item.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {displayList.length === 0 && (
                    <div className="text-center text-tg-muted mt-8 text-sm">
                        {searchQuery ? 'No users found.' : 'No conversations yet.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
