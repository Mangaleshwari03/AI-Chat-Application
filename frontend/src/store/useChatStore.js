import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  groups: [],
  messages: [],
  selectedUser: null,
  selectedGroup: null,

  typingUsers: {}, // userId -> { fullName, groupId }
  activeTab: "chats",

  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  isAIThinking: false,
  isSoundEnabled: true,

  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setAIThinking: (val) => set({ isAIThinking: val }),

  /* ======================
     SELECT USER / GROUP
  ====================== */
  setSelectedUser: (user) => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup } = get();
    if (selectedGroup) socket?.emit("leaveGroup", selectedGroup.id);

    set({ selectedUser: user, selectedGroup: null, messages: [], isAIThinking: false });
  },

  setSelectedGroup: (group) => {
    const socket = useAuthStore.getState().socket;
    const { selectedGroup: oldGroup } = get();
    
    if (oldGroup) socket?.emit("leaveGroup", oldGroup.id);
    if (group) socket?.emit("joinGroup", group.id);

    set({ selectedGroup: group, selectedUser: null, messages: [], isAIThinking: false });
  },

  /* ======================
     CONTACTS
  ====================== */
  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addContact: async (email) => {
    try {
      const res = await axiosInstance.post("/messages/contacts/add", { email });
      set((state) => ({
        allContacts: [...state.allContacts, res.data.contact],
      }));
      toast.success("Contact added!");
      return res.data.contact;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add contact");
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch {
      toast.error("Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  /* ======================
     GROUPS
  ====================== */
  getMyGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/user-groups");
      set({ groups: res.data });
    } catch {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set((state) => ({ groups: [...state.groups, res.data] }));
      toast.success("Group created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  },

  getGroupMessages: async (groupId) => {
    if (!groupId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/messages/${groupId}`);
      set({ messages: res.data });
    } catch {
      toast.error("Failed to load group messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, data) => {
    const { authUser } = useAuthStore.getState();
    const { selectedGroup, setAIThinking } = get();
    const tempId = `temp-${Date.now()}`;

    // Study Circle AI keywords check
    const isStudyCircle = selectedGroup?.isStudyCircle;
    const lowerText = data.text?.toLowerCase() || "";
    const AI_KEYWORDS = ["ai", "summarize", "summary", "summarise", "analyze", "analyse", "mcq", "explain", "what", "how", "tell", "study", "help", "notes", "questions"];
    const willTriggerAI = isStudyCircle && AI_KEYWORDS.some(k => lowerText.includes(k));

    if (willTriggerAI) setAIThinking(true);

    const optimisticMessage = {
      id: tempId,
      senderId: authUser.id,
      groupId: Number(groupId),
      text: data.text || null,
      image: data.image || null,
      fileUrl: data.fileData || null,
      sender: {
        id: authUser.id,
        fullName: authUser.fullName,
        profilePic: authUser.profilePic,
      },
      action: data.text?.match(/\b(hi|hello|hey)\b/i) ? "wave" : "idle",
      emotion: data.text?.match(/\b(hi|hello|hey)\b/i) ? "happy" : "neutral",
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const res = await axiosInstance.post(`/groups/send/${groupId}`, data);
      set((state) => ({
        messages: state.messages.map((m) => (m.id === tempId ? res.data : m)),
      }));
    } catch {
      setAIThinking(false);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }));
      toast.error("Group message failed");
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/groups/${groupId}`);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== Number(groupId)),
        selectedGroup: state.selectedGroup?.id === Number(groupId) ? null : state.selectedGroup,
      }));
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete group");
    }
  },

  /* ======================
     MESSAGES
  ====================== */
  getMessagesByUserId: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (data) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      id: tempId,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      text: data.text || null,
      image: data.image || null,
      fileUrl: data.fileData || null,
      fileType: data.fileData ? (data.fileData.startsWith("data:video") ? "video" : data.fileData.startsWith("data:image") ? "image" : "raw") : null,
      action: data.text?.match(/\b(hi|hello|hey)\b/i) ? "wave" : "idle",
      emotion: data.text?.match(/\b(hi|hello|hey)\b/i) ? "happy" : "neutral",
      isSeen: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        data
      );

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? res.data : m
        ),
      }));
    } catch {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempId),
      }));
      toast.error("Message send failed");
    }
  },

  markMessagesAsSeen: async (userId) => {
    if (!userId) return;
    try {
      await axiosInstance.put(`/messages/mark-seen/${userId}`);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);
      // Optimistically remove from local state
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  clearChatHistory: async (id, isGroup = false) => {
    try {
      await axiosInstance.delete(`/messages/clear/${id}${isGroup ? "?isGroup=true" : ""}`);
      set({ messages: [] });
      toast.success("Chat history cleared");
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to clear chat");
    }
  },


  /* ======================
     SOCKET – MESSAGES
  ====================== */
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    if (!socket || !authUser) return;

    socket.off("newMessage");
    socket.off("newGroupMessage");
    socket.off("newGroup");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messagesSeen");
    socket.off("messageDeleted");
    socket.off("chatCleared");

    socket.on("messagesSeen", ({ senderId }) => {
       const { messages } = get();
       set({
         messages: messages.map(m => m.senderId === senderId ? { ...m, isSeen: true } : m)
       });
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
    });

    socket.on("chatCleared", ({ senderId, groupId }) => {
       const { selectedUser, selectedGroup } = get();
       // Only clear if the user is currently viewing the cleared chat
       const isCurrentDM = selectedUser && Number(selectedUser.id) === Number(senderId);
       const isCurrentGroup = selectedGroup && Number(selectedGroup.id) === Number(groupId);

       if (isCurrentDM || isCurrentGroup) {
          set({ messages: [] });
          toast.info("Chat history was cleared by someone.");
       }
    });

    socket.on("userTyping", ({ userId, fullName, groupId }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [userId]: { fullName, groupId } }
      }));
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      set((state) => {
        const newTyping = { ...state.typingUsers };
        delete newTyping[userId];
        return { typingUsers: newTyping };
      });
    });

    socket.on("newMessage", (msg) => {
      const { selectedUser, messages } = get();
      if (!selectedUser) return;

      const relevant =
        msg.senderId === selectedUser.id ||
        msg.receiverId === selectedUser.id;

      if (!relevant) return;

      // Mark as seen immediately if we are in this chat
      if (msg.senderId === selectedUser.id) {
         get().markMessagesAsSeen(selectedUser.id);
      }

      // Prevent duplicates
      if (messages.find(m => m.id === msg.id)) return;

      // --- AVATAR SPEECH LOGIC ---
      if (msg.senderId !== authUser.id && msg.text) {
        const utterance = new SpeechSynthesisUtterance(msg.text);
        if (msg.emotion === "happy" || msg.emotion === "joy") utterance.pitch = 1.2;
        if (msg.emotion === "angry") {
             utterance.pitch = 0.8;
             utterance.rate = 1.1;
        }
        window.speechSynthesis.speak(utterance);
      }

      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });

    socket.on("newGroupMessage", (msg) => {
      const { selectedGroup, setAIThinking, messages } = get();
      if (!selectedGroup || Number(msg.groupId) !== Number(selectedGroup.id)) return;

      // Prevent duplicates
      if (messages.find(m => m.id === msg.id)) return;

      // Detect if this message (from anyone) should trigger the AI thinking state for everyone
      const lowerText = msg.text?.toLowerCase() || "";
      const AI_KEYWORDS = ["ai", "summarize", "summary", "summarise", "analyze", "analyse", "mcq", "explain", "what", "how", "tell", "study", "help", "notes", "questions"];
      const isAIAction = selectedGroup.isStudyCircle && AI_KEYWORDS.some(k => lowerText.includes(k));
      
      if (isAIAction) setAIThinking(true);
      if (Number(msg.senderId) === 0) setAIThinking(false);

      // --- AVATAR SPEECH LOGIC ---
      if (msg.senderId !== authUser.id && msg.text) {
        const utterance = new SpeechSynthesisUtterance(msg.text);
        if (msg.emotion === "happy" || msg.emotion === "joy") utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
      }

      set((state) => ({
        messages: [...state.messages, msg],
      }));
    });

    socket.on("newGroup", (group) => {
      set((state) => ({
        groups: [...state.groups, group],
      }));
    });

    socket.on("groupDeleted", ({ groupId }) => {
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== Number(groupId)),
        selectedGroup: state.selectedGroup?.id === Number(groupId) ? null : state.selectedGroup,
      }));
      toast.info("A group has been deleted by the admin");
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("newGroupMessage");
    socket?.off("newGroup");
    socket?.off("groupDeleted");
    socket?.off("userTyping");
    socket?.off("userStoppedTyping");
    socket?.off("messageDeleted");
    socket?.off("chatCleared");
  },
}));
