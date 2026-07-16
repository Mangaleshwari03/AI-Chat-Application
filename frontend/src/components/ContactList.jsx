import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, Search } from "lucide-react";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, addContact } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsAdding(true);
    await addContact(email);
    setEmail("");
    setIsAdding(false);
  };

  if (isUsersLoading && allContacts.length === 0) return <UsersLoadingSkeleton />;

  return (
    <div className="space-y-4">
      {/* ADD CONTACT INPUT */}
      <form onSubmit={handleAddContact} className="relative group">
        <input
          type="email"
          placeholder="Add contact by email..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
        <button
          type="submit"
          disabled={isAdding}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Your Contacts</p>
        {allContacts.length === 0 && (
          <div className="text-center py-8 px-4 border border-dashed border-slate-700 rounded-xl">
            <p className="text-xs text-slate-500 italic">No contacts added yet. Use the search above to add your friends!</p>
          </div>
        )}
        {allContacts.map((contact) => (
          <div
            key={contact.id}
            className="group p-3 rounded-xl cursor-pointer bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
            onClick={() => setSelectedUser(contact)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-full overflow-hidden border border-slate-700">
                  <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} className="w-full h-full object-cover" />
                </div>
                {onlineUsers.includes(contact.id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-slate-200 truncate">{contact.fullName}</h4>
                <p className="text-[10px] text-slate-500 truncate">{contact.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactList;
