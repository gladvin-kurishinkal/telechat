import { format } from 'date-fns';
import { Check, CheckCheck, X, Play } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface MessageBubbleProps {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    image?: string;
    video?: string;
    isOwnMsg?: boolean;
    isRead?: boolean;
}

const MessageBubble = ({ text, timestamp, image, video, isOwnMsg, isRead = true }: MessageBubbleProps) => {
    const [isFullscreenVideo, setIsFullscreenVideo] = useState(false);

    // Construct absolute URL for media files
    const mediaUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5001${path}`; // TODO: Use env variable for backend URL
    };

    return (
        <>
            <div className={`flex w-full mb-2 ${isOwnMsg ? 'justify-end' : 'justify-start'}`}>
                <div
                    className={`relative px-3 py-2 shadow-sm
            ${image || video ? 'max-w-full sm:max-w-[85%]' : 'max-w-[85%] sm:max-w-[75%]'}
            ${isOwnMsg
                            ? 'bg-tg-blue text-white rounded-t-2xl rounded-l-2xl rounded-br-sm'
                            : 'bg-tg-panel text-white rounded-t-2xl rounded-r-2xl rounded-bl-sm'
                        }`}
                >
                    {/* Simple CSS Tail (More reliable than SVG rendering) */}
                    <div
                        className={`absolute bottom-0 w-3 h-3 overflow-hidden
                ${isOwnMsg
                                ? '-right-1.5'
                                : '-left-1.5'
                            }`}
                    >
                        <div
                            className={`w-4 h-4 rounded-full absolute bottom-0 
                ${isOwnMsg
                                    ? 'bg-tg-blue right-1.5'
                                    : 'bg-tg-panel left-1.5'
                                }`}
                        />
                    </div>

                    <div className="flex flex-col min-w-[60px]">
                        {image && (
                            <div className="-mx-2 -mt-1 mb-1 relative overflow-hidden rounded-t-[14px]">
                                <img
                                    src={mediaUrl(image)}
                                    alt="Attachment"
                                    className="max-h-[500px] w-full object-cover"
                                />
                            </div>
                        )}
                        {video && (
                            <div
                                className="-mx-2 -mt-1 mb-1 relative overflow-hidden rounded-t-[14px] cursor-pointer group flex items-center justify-center bg-black/20"
                                onClick={() => setIsFullscreenVideo(true)}
                            >
                                <video
                                    src={mediaUrl(video)}
                                    className="max-h-[500px] w-full object-cover pointer-events-none"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:scale-110 transition-transform">
                                        <Play size={24} className="translate-x-[2px]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        {text && (
                            <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap z-10 relative pr-12 pb-1">
                                {text}
                            </p>
                        )}

                        <div
                            className={`absolute bottom-[4px] right-2 text-[11px] font-medium flex items-center gap-[2px] leading-none z-10 select-none
                ${isOwnMsg ? 'text-blue-200' : 'text-tg-muted'}
                `}
                        >
                            <span>{format(timestamp, 'HH:mm')}</span>
                            {isOwnMsg && (
                                <span className="ml-[2px] flex items-center justify-center">
                                    {isRead ? (
                                        <CheckCheck size={14} strokeWidth={2.5} className="text-[#34d399]" />
                                    ) : (
                                        <Check size={14} strokeWidth={2.5} className="text-blue-200" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Video Portal */}
            {isFullscreenVideo && video && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm">
                    <button
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        onClick={() => setIsFullscreenVideo(false)}
                    >
                        <X size={24} />
                    </button>

                    <video
                        src={mediaUrl(video)}
                        controls
                        autoPlay
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>,
                document.body
            )}
        </>
    );
};

export default MessageBubble;
