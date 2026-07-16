import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { Plus, Users, Sparkles } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

function ChatsList() {
  const { 
    getMyChatPartners, 
    chats, 
    getMyGroups, 
    groups, 
    isUsersLoading, 
    setSelectedUser, 
    setSelectedGroup,
    selectedUser,
    selectedGroup 
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getMyChatPartners();
    getMyGroups();
  }, [getMyChatPartners, getMyGroups]);

  if (isUsersLoading && chats.length === 0 && groups.length === 0) return <UsersLoadingSkeleton />;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 transition-colors text-slate-300 hover:text-indigo-400 group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        <span className="text-sm font-medium">Create Group</span>
      </button>

      {/* GROUPS SECTION */}
      {groups.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Groups</p>
          {groups.map((group) => (
            <div
              key={`group-${group.id}`}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                selectedGroup?.id === group.id 
                ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                  selectedGroup?.id === group.id 
                    ? "bg-white/20 border-white/30" 
                    : group.isStudyCircle 
                      ? "bg-indigo-500/20 border-indigo-500/30" 
                      : "bg-slate-700 border-slate-600"
                }`}>
                  {group.groupPic ? (
                    <img src={group.groupPic} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className={`text-sm font-bold uppercase ${selectedGroup?.id === group.id ? "text-white" : group.isStudyCircle ? "text-indigo-400" : "text-slate-400"}`}>
                      {group.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${selectedGroup?.id === group.id ? "text-white" : "text-slate-200"}`}>
                    {group.name}
                  </h4>
                  <p className={`text-[10px] truncate font-medium flex items-center gap-1 ${
                    selectedGroup?.id === group.id 
                      ? "text-indigo-100" 
                      : group.isStudyCircle 
                        ? "text-indigo-400" 
                        : "text-slate-500"
                  }`}>
                    {group.isStudyCircle && <Sparkles className="w-3 h-3 animate-pulse" />}
                    {group.isStudyCircle ? "Smart Study Circle" : "Group Chat"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INDIVIDUAL CHATS */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Direct Messages</p>
        {chats.length === 0 && <p className="text-xs text-slate-500 px-2 italic">No chats yet</p>}
        {chats.map((chat) => (
          <div
            key={`chat-${chat.id}`}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
              selectedUser?.id === chat.id 
              ? "bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/20" 
              : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
            }`}
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full overflow-hidden border border-slate-700">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="w-full h-full object-cover" />
                </div>
                {onlineUsers.includes(chat.id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium truncate ${selectedUser?.id === chat.id ? "text-white" : "text-slate-200"}`}>
                  {chat.fullName}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && <CreateGroupModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default ChatsList;
