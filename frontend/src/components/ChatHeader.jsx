import { X, Users, Sparkles, Trash2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

function ChatHeader() {
  const {
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    deleteGroup,
    clearChatHistory,
    typingUsers,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const handleClose = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, setSelectedGroup]);

  if (!selectedUser && !selectedGroup) return null;

  const title = selectedUser ? selectedUser.fullName : selectedGroup.name;
  const avatar = selectedUser ? selectedUser.profilePic : selectedGroup.groupPic;
  const isOnline = selectedUser ? onlineUsers.includes(Number(selectedUser.id)) : false;

  let statusText = "";
  if (selectedUser) {
    const isTyping = typingUsers[selectedUser.id];
    statusText = isTyping ? "typing..." : (isOnline ? "Online" : "Offline");
  } else if (selectedGroup) {
    const groupTyping = Object.values(typingUsers).filter(u => Number(u.groupId) === Number(selectedGroup.id));
    if (groupTyping.length > 0) {
      statusText = groupTyping.length === 1
        ? `${groupTyping[0].fullName} is typing...`
        : `${groupTyping.length} users are typing...`;
    } else {
      statusText = selectedGroup.isStudyCircle ? "✨ Smart Study Circle" : "Group Chat";
    }
  }

  return (
    <div className="flex justify-between items-center bg-slate-800/80 border-b border-slate-700 p-4 backdrop-blur-md">
      <div className="flex items-center space-x-4">
        <div className={`avatar ${selectedUser && isOnline ? "online" : ""}`}>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
            {avatar ? (
              <img src={avatar || "/avatar.png"} alt={title} className="object-cover w-full h-full" />
            ) : selectedUser ? (
              <img src="/avatar.png" alt={title} />
            ) : (
              <Users className="w-6 h-6 text-slate-400" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold leading-tight">{title}</h3>
            {selectedGroup?.isStudyCircle && <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />}
          </div>
          <p className={`text-[10px] mt-0.5 font-medium ${selectedUser && typingUsers[selectedUser.id] ? "text-emerald-400 animate-pulse" : selectedGroup && Object.values(typingUsers).some(u => Number(u.groupId) === Number(selectedGroup.id)) ? "text-emerald-400 animate-pulse" : selectedGroup?.isStudyCircle ? "text-indigo-400" : "text-slate-400"}`}>{statusText}</p>
        </div>

      </div>

      <div className="flex items-center gap-2">
        {/* Clear Chat Button — For DM: Everyone | For Group: Only Admin */}
        {((selectedUser) || (selectedGroup && selectedGroup.adminId === authUser.id)) && (
          <button
            onClick={() => {
              if (window.confirm("Clear all messages in this chat? This cannot be undone.")) {
                const id = selectedUser ? selectedUser.id : selectedGroup.id;
                clearChatHistory(id, !!selectedGroup);
              }
            }}
            className="p-2 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}

        {/* Delete Group (Admin only) */}
        {selectedGroup && selectedGroup.adminId === authUser.id && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this group?")) {
                deleteGroup(selectedGroup.id);
              }
            }}
            className="p-2 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-400 transition-colors border border-rose-500/30"
            title="Delete Group"
          >
            <Users className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleClose}
          className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition-all transform hover:rotate-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
