import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, X, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose }) => {
  const { allContacts, getAllContacts, createGroup, isUsersLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupPic, setGroupPic] = useState(null);
  const [isStudyCircle, setIsStudyCircle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setGroupPic(reader.result);
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("Group name is required");
    if (selectedMembers.length === 0)
      return toast.error("Please select at least one member");

    setIsSubmitting(true);
    const success = await createGroup({
      name: groupName,
      description,
      members: selectedMembers,
      groupPic,
      isStudyCircle,
    });
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Create New Group</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* GROUP PIC */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden">
                {groupPic ? (
                  <img src={groupPic} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-500" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-400">Add Group Photo</span>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <textarea
              placeholder="Description (Optional)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg cursor-pointer hover:bg-indigo-500/20 transition-colors">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={isStudyCircle}
                onChange={(e) => setIsStudyCircle(e.target.checked)}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-400">✨ Smart Study Circle</p>
                <p className="text-[10px] text-slate-400">Enable AI Assistant & PDF Analysis</p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Select Members</label>
            <div className="bg-slate-800 border border-slate-700 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-700">
              {isUsersLoading ? (
                <div className="flex items-center justify-center p-8 gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading contacts...</span>
                </div>
              ) : allContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm italic">
                  No contacts found
                </div>
              ) : (
                allContacts
                  .filter((u) => u.id !== authUser.id)
                  .map((user) => (
                    <div
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-700 transition-colors ${
                        selectedMembers.includes(user.id) ? "bg-indigo-500/20" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden border border-white/10">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          user.fullName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border ${
                          selectedMembers.includes(user.id)
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-slate-500"
                        } flex items-center justify-center transition-all`}
                      >
                        {selectedMembers.includes(user.id) && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
