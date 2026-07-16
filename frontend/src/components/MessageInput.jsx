import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Image, Send, X } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, sendGroupMessage, selectedUser, selectedGroup, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;

    if (selectedGroup) {
      sendGroupMessage(selectedGroup.id, {
        text: text.trim(),
        fileData: filePreview,
        fileName: fileInfo?.name,
      });
    } else {
      sendMessage({
        text: text.trim(),
        fileData: filePreview,
      });
    }

    // Stop typing immediately when message is sent
    const socket = useAuthStore.getState().socket;
    const receiverId = selectedUser?.id || selectedGroup?.id;
    if (socket && receiverId) {
      socket.emit("stopTyping", { receiverId, isGroup: !!selectedGroup });
    }

    setText("");
    setFilePreview(null);
    setFileInfo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    isSoundEnabled && playRandomKeyStrokeSound();

    // Typing logic
    const socket = useAuthStore.getState().socket;
    const receiverId = selectedUser?.id || selectedGroup?.id;
    const isGroup = !!selectedGroup;

    if (socket && receiverId) {
      socket.emit("typing", { receiverId, isGroup });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId, isGroup });
      }, 2000); // Stop after 2s of no typing
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // limit to 50MB generally, but 10MB for Study Circle PDFs/Text/Docx files
    const isDoc = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") || 
                  file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt") ||
                  file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
    const maxSize = (selectedGroup?.isStudyCircle && isDoc) ? 10 * 1024 * 1024 : 50 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setFileInfo({
      name: file.name,
      type: file.type,
    });

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {/* FILE PREVIEW */}
      {filePreview && (
        <div className="max-w-3xl mx-auto mb-3">
          <div className="relative w-fit bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-3">
            {fileInfo?.type.startsWith("image/") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-md"
              />
            ) : fileInfo?.type.startsWith("video/") ? (
              <video
                src={filePreview}
                className="w-20 h-20 object-cover rounded-md"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-700 rounded-md flex items-center justify-center text-xs text-center p-1 break-all">
                {fileInfo?.name}
              </div>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-200" />
            </button>
          </div>
        </div>
      )}

      {/* MESSAGE INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex gap-4"
      >
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="
            flex-1 
            bg-slate-800/50 
            border border-slate-700/50 
            text-slate-200 
            placeholder-slate-400
            rounded-lg 
            py-2 px-4
            focus:outline-none
            focus:ring-2 focus:ring-cyan-500/50
          "
        />

        {/* FILE INPUT */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* FILE BUTTON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 rounded-lg px-4 transition-colors ${filePreview ? "text-cyan-500" : "text-slate-400 hover:text-slate-200"
            }`}
        >
          <Image className="w-5 h-5" />
        </button>

        {/* SEND BUTTON */}
        <button
          type="submit"
          disabled={!text.trim() && !filePreview}
          className="
            bg-gradient-to-r 
            from-cyan-500 to-cyan-600 
            text-white 
            rounded-lg 
            px-4 py-2 
            font-medium
            hover:from-cyan-600 hover:to-cyan-700
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
