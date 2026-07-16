import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import AIChatContainer from "../components/AIChatContainer";

function ChatPage() {
  const { activeTab, selectedUser, selectedGroup } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" && (
              <>
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-sm font-semibold text-slate-400">Conversations</h2>
                </div>
                <ChatsList />
              </>
            )}
            {activeTab === "contacts" && <ContactList />}
            {activeTab === "ai" && (
              <div className="p-4 text-center text-slate-400 mt-10">
                <p>🤖 Meta AI is ready to help!</p>
                <p className="text-sm mt-2">Click on the right side to start chatting.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {activeTab === "ai" ? (
            <AIChatContainer />
          ) : (!selectedUser && !selectedGroup) ? (
            <NoConversationPlaceholder />
          ) : (
            <ChatContainer />
          )}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
