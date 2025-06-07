export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatMessages: [],
  selectedChatData: undefined,
  dmContacts: [],
  unreadMessages: {},
  onlineUsers: [],

  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
  setSelectedChatData: (selectedChatData) => {
    // Clear unread messages when selecting a chat
    if (selectedChatData) {
      const unreadMessages = get().unreadMessages;
      set({
        selectedChatData,
        unreadMessages: {
          ...unreadMessages,
          [selectedChatData._id]: 0,
        },
      });
    } else {
      set({ selectedChatData });
    }
  },
  setDmContacts: (dmContacts) => set({ dmContacts }),

  closeChat: () => {
    set({
      selectedChatType: undefined,
      selectedChatMessages: [],
      selectedChatData: undefined,
    });
  },

  deleteMessage: (messageId) => {
    const selectedChatMessages = get().selectedChatMessages;
    const filteredMessages = selectedChatMessages.filter(
      (msg) => msg._id !== messageId
    );

    // If no messages left, remove contact from DM list
    if (filteredMessages.length === 0 && get().selectedChatData) {
      const dmContacts = get().dmContacts;
      const updatedContacts = dmContacts.filter(
        (contact) => contact._id !== get().selectedChatData._id
      );
      set({
        selectedChatMessages: [],
        dmContacts: updatedContacts,
        selectedChatData: undefined,
        selectedChatType: undefined,
      });
    } else {
      set({
        selectedChatMessages: filteredMessages,
      });
    }
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatData = get().selectedChatData;
    const userInfo = get().userInfo;
    const unreadMessages = get().unreadMessages;
    const dmContacts = get().dmContacts;

    // Determine the chat partner's ID for this message
    let chatPartnerId = null;
    if (userInfo) {
      if (message.sender && message.sender._id !== userInfo._id) {
        chatPartnerId = message.sender._id;
      } else if (message.recipient && message.recipient._id !== userInfo._id) {
        chatPartnerId = message.recipient._id;
      }
    }

    // Only add to selectedChatMessages if the message is for the currently open chat
    if (selectedChatData && selectedChatData._id === chatPartnerId) {
      set({
        selectedChatMessages: [...selectedChatMessages, message],
      });
    } else {
      // Increment unread count if the message is not for the currently open chat
      if (chatPartnerId) {
        set({
          unreadMessages: {
            ...unreadMessages,
            [chatPartnerId]: (unreadMessages[chatPartnerId] || 0) + 1,
          },
        });
      }
    }

    // Update contacts list logic (move contact to top, etc.) as before
    let updatedContacts = dmContacts.slice();
    if (chatPartnerId) {
      const existingIndex = dmContacts.findIndex(
        (c) => c._id === chatPartnerId
      );
      if (existingIndex !== -1) {
        // Move to top
        const [contact] = updatedContacts.splice(existingIndex, 1);
        updatedContacts = [contact, ...updatedContacts];
      } else {
        // Add to top (for first-time message)
        updatedContacts = [message.sender, ...updatedContacts];
      }
      set({ dmContacts: updatedContacts });
    }
  },
});