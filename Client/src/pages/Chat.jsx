import React, { useEffect } from "react";
import { useStore } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./chat-components/contacts-container";
import EmptyChatContainer from "./chat-components/empty-chat-container";
import ChatContainer from "./chat-components/chat-container";

const Chat = () => {
  const { userInfo, selectedChatType } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast.warning("Please complete profile to continue");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex w-full min-h-screen bg-dark-primary">
      <div className="flex-none lg:block">
        <ContactsContainer />
      </div>
      <div className="flex-1">
        {selectedChatType === undefined ? (
          <EmptyChatContainer />
        ) : (
          <ChatContainer />
        )}
      </div>
    </div>
  );
};

export default Chat;
