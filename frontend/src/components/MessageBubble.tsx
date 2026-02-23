import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isOwnMsg?: boolean;
    isRead?: boolean;
}

const MessageBubble = ({ text, timestamp, isOwnMsg, isRead = true }: MessageBubbleProps) => {
    return (
        <div className={`flex w-full mb-2 ${isOwnMsg ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`relative max-w-[85%] sm:max-w-[75%] px-3 py-2 shadow-sm
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
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap z-10 relative pr-12 pb-1">
                        {text}
                    </p>

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
    );
};

export default MessageBubble;
