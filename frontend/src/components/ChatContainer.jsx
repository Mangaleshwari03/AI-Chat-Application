import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { formatMessageTime } from "../lib/utils";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import InteractiveAvatar from "./InteractiveAvatar";

function ChatContainer() {
  const {
    selectedUser,
    selectedGroup,
    getMessagesByUserId,
    getGroupMessages,
    messages,
    isMessagesLoading,
    isAIThinking,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsSeen,
    deleteMessage,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser.id);
      markMessagesAsSeen(selectedUser.id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup.id);
    }
    
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, selectedGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getChatPartnerAvatar = (msg) => {
    if (msg.senderId === 0 || msg.senderId === null) return "/ai_avatar.png"; // AI Assistant
    if (msg.senderId === authUser.id) return authUser.profilePic || "/avatar.png";
    if (selectedUser) return selectedUser.profilePic || "/avatar.png";
    return msg.sender?.profilePic || "/avatar.png";
  };

  const getSenderName = (msg) => {
    if (msg.senderId === 0 || msg.senderId === null) return "Meta AI";
    if (msg.senderId === authUser.id) return "You";
    if (selectedUser) return selectedUser.fullName;
    return msg.sender?.fullName || "Member";
  };

  return (
    <>
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat ${msg.senderId === authUser.id ? "chat-end" : "chat-start"} mb-4 group`}
            >
              <div className="chat-image avatar self-end mb-1 !overflow-visible">
                <InteractiveAvatar
                  src={getChatPartnerAvatar(msg)}
                  action={msg.action}
                  emotion={msg.emotion}
                  isLatest={messages.indexOf(msg) === messages.length - 1}
                />
              </div>
              
              <div className="chat-header mb-1 text-xs opacity-50 flex items-center gap-2">
                {selectedGroup && msg.senderId !== authUser.id && (
                  <span className="font-bold text-indigo-400">{getSenderName(msg)}</span>
                )}
                <time className="text-[10px]">{formatMessageTime(msg.createdAt)}</time>
              </div>

              <div className={`chat-bubble flex flex-col relative overflow-hidden max-w-full break-words ${
                msg.senderId === authUser.id 
                  ? "bg-indigo-600 text-white" 
                  : (msg.senderId === 0 || msg.senderId === null)
                    ? "bg-slate-900 border border-indigo-500/30 text-indigo-50 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]"
                    : "bg-slate-800 text-slate-100"
              }`}>
                {(msg.senderId === 0 || msg.senderId === null) && (
                  <div className="absolute top-0 right-0 p-1 opacity-20">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                  </div>
                )}
                
                {(msg.image || msg.fileUrl) && (
                  <div className="mb-2">
                    {msg.fileType === "video" || (msg.fileUrl && msg.fileUrl.match(/\.(mp4|webm|ogg)$/i)) ? (
                      <video
                        src={msg.fileUrl || msg.image}
                        controls
                        className="max-w-[250px] rounded-lg shadow-sm"
                      />
                    ) : (msg.fileType === "raw" || (msg.fileUrl && !msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) && !msg.image && !msg.fileType?.startsWith("image"))) ? (
                      <a
                        href={msg.fileUrl || msg.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-black/20 p-3 rounded-lg border border-white/10 hover:bg-black/30 transition-colors max-w-[200px]"
                        download
                      >
                        <span className="text-xs text-white font-medium underline break-all text-center">
                          Download Attachment
                        </span>
                      </a>
                    ) : (
                      <img
                        src={msg.fileUrl || msg.image}
                        alt="Attachment"
                        className="max-w-[250px] rounded-lg shadow-sm"
                      />
                    )}
                  </div>
                )}
                {msg.text && (
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap break-all w-full ${msg.senderId === 0 ? "font-medium" : ""}`}>
                    {msg.text}
                  </p>
                )}
                {msg.senderId === authUser.id && (
                  <div className="flex justify-end mt-1">
                    {msg.isSeen ? (
                       <span className="text-[10px] text-cyan-400 flex items-center gap-0.5 font-bold">
                         Seen ✓✓
                       </span>
                    ) : (
                       <span className="text-[10px] opacity-40 flex items-center gap-0.5">
                         Sent ✓
                       </span>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button — sender can delete their own, anyone can delete AI messages */}
              {(msg.senderId === authUser.id || msg.senderId === 0 || msg.senderId === null) && (
                <button
                  onClick={() => {
                    if (window.confirm("Delete this message?")) {
                      deleteMessage(msg.id);
                    }
                  }}
                  className={`self-end mb-1 mx-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-slate-800/80 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 shadow-xl ${msg.senderId === authUser.id ? "order-first" : ""}`}
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}

        {isAIThinking && (
          <div className="chat chat-start mb-8 animate-pulse">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border border-indigo-500/50 overflow-hidden bg-indigo-900/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="chat-header mb-1 text-xs opacity-50 flex items-center gap-2">
               <span className="font-bold text-indigo-400">Meta AI</span>
               <span className="text-[10px] italic">Thinking...</span>
            </div>
            <div className="chat-bubble bg-indigo-900/30 border border-indigo-500/20 text-indigo-100 flex flex-col gap-2 py-3 px-4 rounded-2xl rounded-tl-none">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span className="text-sm font-medium italic">AI is reading the documents...</span>
              </div>
              <div className="flex gap-1 ml-7">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;
