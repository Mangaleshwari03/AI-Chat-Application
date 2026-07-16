import { useState, useRef, useEffect } from "react";
import { useAIStore } from "../store/useAIStore";
import { Bot, User, Trash2, Send, Image, X } from "lucide-react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import toast from "react-hot-toast";

function AIChatContainer() {
    const { messages, sendAIMessage, isAILoading, clearChat, deleteSingleMessage } = useAIStore();
    const [text, setText] = useState("");
    const [filePreview, setFilePreview] = useState(null);
    const [fileInfo, setFileInfo] = useState(null);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const { playRandomKeyStrokeSound } = useKeyboardSound();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isDoc = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") || file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
        const maxSize = 10 * 1024 * 1024; // 10MB limit

        if (file.size > maxSize) {
            toast.error(`File size must be less than 10MB`);
            return;
        }

        setFileInfo({ name: file.name, type: file.type });

        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setFilePreview(null);
        setFileInfo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim() && !filePreview) return;

        sendAIMessage({ text: text.trim(), fileData: filePreview, fileName: fileInfo?.name });
        
        setText("");
        setFilePreview(null);
        setFileInfo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* HEADER */}
            <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                        <Bot className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-slate-200 font-medium">Meta AI</h3>
                        <p className="text-slate-400 text-xs">Share images, PDFs, or TXTs and chat with me!</p>
                    </div>
                </div>
                <button onClick={clearChat} className="text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-700/50 rounded-full">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <Bot className="w-16 h-16 opacity-30 text-cyan-500" />
                        <p className="font-medium">Start a smart conversation!</p>
                        <p className="text-xs max-w-xs text-center">You can ask questions, summarize documents, or upload an image to analyze.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"} group relative`}>
                        <div className="chat-image avatar">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-slate-700" : "bg-cyan-500/20 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]"}`}>
                                {msg.role === "user" ? (
                                    <User className="w-5 h-5 text-slate-300 m-2" />
                                ) : (
                                    <Bot className="w-6 h-6 text-cyan-400 m-2" />
                                )}
                            </div>
                        </div>
                        <div className={`chat-bubble flex flex-col relative overflow-hidden max-w-[85%] break-words whitespace-pre-wrap ${msg.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200 border border-slate-700 leading-relaxed"}`}>
                            {msg.fileData && (
                                <div className="mb-2 w-full max-w-[250px] overflow-hidden rounded-md">
                                    {msg.fileData.startsWith("data:image/") ? (
                                        <img src={msg.fileData} alt="" className="w-full object-cover rounded-md" />
                                    ) : (
                                        <div className="bg-slate-700/50 p-2 rounded text-xs border border-slate-600 flex items-center gap-2">
                                            📄 {msg.fileName}
                                        </div>
                                    )}
                                </div>
                            )}
                            {msg.text}
                        </div>

                        {/* Delete single AI message on hover */}
                        <button
                            onClick={() => deleteSingleMessage(idx)}
                            className={`self-center mx-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/50 ${msg.role === "user" ? "order-first" : ""}`}
                            title="Delete this message"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {isAILoading && (
                    <div className="chat chat-start">
                        <div className="chat-image avatar">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse flex items-center justify-center">
                                <Bot className="w-6 h-6 text-cyan-400" />
                            </div>
                        </div>
                        <div className="chat-bubble bg-slate-800 border border-cyan-500/20 text-cyan-400 text-sm animate-pulse tracking-wide font-medium flex items-center gap-1">
                            Analyzing the data<span className="animate-bounce inline-block">.</span><span className="animate-bounce inline-block delay-100">.</span><span className="animate-bounce inline-block delay-200">.</span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* INPUT UI (MessageInput logic) */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/20">
                {filePreview && (
                    <div className="max-w-3xl mb-3">
                        <div className="relative w-fit bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-3">
                            {fileInfo?.type.startsWith("image/") ? (
                                <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                            ) : (
                                <div className="w-16 h-16 bg-slate-700 rounded-md flex items-center justify-center text-[10px] text-center p-1 break-all overflow-hidden font-medium text-slate-300">
                                    {fileInfo?.name}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={removeFile}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            >
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="file"
                        accept="image/*,application/pdf,text/plain"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors ${filePreview ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>

                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            playRandomKeyStrokeSound();
                        }}
                        placeholder="Type a message or upload file..."
                        className="flex-1 bg-slate-800 border border-slate-600 focus:border-cyan-500 text-slate-200 rounded-full px-5 py-2.5 focus:outline-none transition-colors"
                    />

                    <button
                        type="submit"
                        disabled={(!text.trim() && !filePreview) || isAILoading}
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 transition-all shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AIChatContainer;
