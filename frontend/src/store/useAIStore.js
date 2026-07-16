import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAIStore = create((set) => ({
    messages: [],
    isAILoading: false,

    sendAIMessage: async ({ text, fileData, fileName }) => {
        set({ isAILoading: true });

        // Add user message immediately
        const userMessage = { role: "user", text, fileData, fileName };
        set((state) => ({ messages: [...state.messages, userMessage] }));

        try {
            const res = await axiosInstance.post("/ai/chat", { message: text, fileData, fileName });

            const aiMessage = { role: "ai", text: res.data.reply };
            set((state) => ({ messages: [...state.messages, aiMessage] }));

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to get AI response");
        } finally {
            set({ isAILoading: false });
        }
    },

    deleteSingleMessage: (index) => {
        set((state) => ({
            messages: state.messages.filter((_, i) => i !== index)
        }));
    },

    clearChat: () => set({ messages: [] }),
}));
