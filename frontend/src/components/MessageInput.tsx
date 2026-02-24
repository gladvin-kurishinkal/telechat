import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

interface MessageInputProps {
    onSendMessage: (text: string, file: File | null) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [message]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);
            setFilePreview(objectUrl);
        }
        // Reset the input value so the same file can be selected again if removed
        if (e.target) {
            e.target.value = '';
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() || selectedFile) {
            onSendMessage(message.trim(), selectedFile);
            setMessage('');
            handleRemoveFile(); // Clear file after sending
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="bg-tg-dark w-full mx-auto px-4 py-3 flex flex-col gap-2 shrink-0">
            {/* File Preview Area */}
            {filePreview && (
                <div className="relative self-start mt-1 mb-2">
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10 hover:bg-red-600 shadow-md"
                    >
                        &times;
                    </button>
                    {selectedFile?.type.startsWith('image/') ? (
                        <img src={filePreview} alt="Preview" className="h-20 w-auto rounded-md object-cover border border-tg-panel" />
                    ) : (
                        <video src={filePreview} className="h-20 w-auto rounded-md object-cover border border-tg-panel" />
                    )}
                </div>
            )}

            <div className="flex items-end gap-2 w-full">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-tg-muted hover:text-tg-badge hover:bg-tg-panel transition-colors"
                    title="Attach multimedia"
                >
                    <Paperclip size={24} strokeWidth={1.5} className="-rotate-45" />
                </button>

                <div className="flex-1 bg-tg-panel rounded-2xl flex items-end overflow-hidden shadow-sm shadow-black/10 min-h-[44px]">
                    <button
                        type="button"
                        className="w-11 h-11 flex items-center justify-center shrink-0 text-tg-muted hover:text-tg-badge transition-colors self-end"
                        title="Insert emoji"
                    >
                        <Smile size={24} strokeWidth={1.5} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message"
                        className="flex-1 max-h-[150px] py-[11px] px-1 bg-transparent text-tg-text text-[15px] resize-none outline-none custom-scrollbar leading-[1.4]"
                        rows={1}
                    />

                    {/* Placeholder spacer to ensure button doesn't overlap text when fully wrapped */}
                    <div className="w-[12px] shrink-0" />
                </div>

                {message.trim().length > 0 || selectedFile ? (
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-11 h-11 rounded-full bg-tg-badge flex items-center justify-center shrink-0 text-white hover:bg-[#4396d1] transition-all shadow-md active:scale-95"
                        title="Send message"
                    >
                        <Send size={20} strokeWidth={2} className="translate-x-[2px]" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="w-11 h-11 rounded-full bg-tg-panel flex items-center justify-center shrink-0 text-tg-muted hover:text-tg-badge transition-all"
                    >
                        <Mic size={24} strokeWidth={1.5} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageInput;
