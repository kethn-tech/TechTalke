import React, { useState, useEffect } from "react";
import { useStore } from "@/store/store";
import { UserCircle2, Search, X } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import ProfileView from "@/pages/chat-components/contacts-container/components/profile-view";
import { motion, AnimatePresence } from "framer-motion";
import { MdCancel } from "react-icons/md";

const ChatHeader = () => {
  const {
    selectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    userInfo,
    selectedChatType,
    onlineUsers,
  } = useStore();

  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isUserAlone, setIsUserAlone] = useState(true);
  const [originalMessages, setOriginalMessages] = useState([]);

  // Store original messages when search starts
  useEffect(() => {
    if (!isSearching && selectedChatMessages.length > 0) {
      setOriginalMessages(selectedChatMessages);
    }
  }, [selectedChatMessages, isSearching]);

  // Check if user is alone (you can implement your own logic here)
  useEffect(() => {
    const checkUserStatus = () => {
      const isDocumentVisible = !document.hidden;
      const hasRecentActivity =
        Date.now() - (localStorage.getItem("lastActivity") || 0) < 300000; // 5 minutes

      setIsUserAlone(isDocumentVisible && hasRecentActivity);
    };

    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
      checkUserStatus();
    };

    document.addEventListener("mousemove", updateActivity);
    document.addEventListener("keypress", updateActivity);
    document.addEventListener("visibilitychange", checkUserStatus);

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 60000);

    return () => {
      document.removeEventListener("mousemove", updateActivity);
      document.removeEventListener("keypress", updateActivity);
      document.removeEventListener("visibilitychange", checkUserStatus);
      clearInterval(interval);
    };
  }, []);

  // Handle search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(query.length > 0);

    if (query.length > 0) {
      // Filter messages based on search query
      const filteredMessages = originalMessages.filter((message) =>
        message.content?.toLowerCase().includes(query.toLowerCase())
      );
      setSelectedChatMessages(filteredMessages);
    } else {
      // Restore original messages when search is cleared
      setSelectedChatMessages(originalMessages);
    }
  };

  const handleSearchToggle = () => {
    if (showSearch && searchQuery) {
      // Clear search and restore original messages
      setSearchQuery("");
      setIsSearching(false);
      setSelectedChatMessages(originalMessages);
    }
    setShowSearch(!showSearch);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSelectedChatMessages(originalMessages);
  };

  // Get filtered message count for display
  const filteredCount = searchQuery ? selectedChatMessages.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className=" border-b border-dark-accent/30 backdrop-blur-sm bg-dark-accent/5"
    >
      <MdCancel
        className="absolute top-4 right-0.5 text-2xl cursor-pointer text-dark-muted opacity-0 hover:opacity-100 hover:text-blue-400 transition-opacity duration-300"
        onClick={() => (window.location.href = "/chat")}
      />
      {/* Header Content */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 pr-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:bg-dark-accent/20 p-2 rounded-lg transition-all duration-300 group"
          >
            <motion.div whileHover={{ rotate: 5 }}>
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-blue-500/30 transition-all duration-300 shadow-glow group-hover:ring-blue-500/50">
                  {selectedChatData?.image ? (
                    <AvatarImage
                      src={selectedChatData.image}
                      alt="Profile"
                      className="object-cover"
                    />
                  ) : (
                    <UserCircle2 className="text-dark-muted" />
                  )}
                </Avatar>
                {/* Online status indicator */}
                {selectedChatType === "dm" &&
                  selectedChatData &&
                  onlineUsers.includes(selectedChatData._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-dark-primary shadow-glow" />
                  )}
              </div>
            </motion.div>
            <div className="flex-1">
              <motion.h2 className="font-medium text-dark-text bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {selectedChatData?.firstName && selectedChatData?.lastName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData?.email}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1.5"
              >
                <p className="text-sm text-dark-muted truncate">
                  {selectedChatType === "dm" &&
                  selectedChatData &&
                  onlineUsers.includes(selectedChatData._id)
                    ? "Online"
                    : "Offline"}
                </p>
              </motion.div>
            </div>
          </motion.button>

          {/* Search Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchToggle}
            className={`
              p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg
              ${
                showSearch
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                  : "bg-dark-accent/20 hover:bg-dark-accent/30 border-dark-accent/30 text-dark-muted hover:text-white"
              }
            `}
          >
            {showSearch ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Expandable Search Section */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-dark-accent/20"
          >
            <div className="p-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl blur-xl" />
                <div className="relative bg-dark-accent/30 backdrop-blur-md border border-dark-accent/40 rounded-xl p-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      autoFocus={showSearch}
                      className="w-full bg-transparent text-dark-text pl-12 pr-4 py-3 focus:outline-none placeholder:text-gray-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-muted hover:text-red-400 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Results Counter */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-center"
                >
                  <span
                    className={`
                    px-3 py-1 rounded-full backdrop-blur-sm
                    ${
                      filteredCount > 0
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }
                  `}
                  >
                    {filteredCount > 0
                      ? `${filteredCount} message${
                          filteredCount !== 1 ? "s" : ""
                        } found`
                      : "No messages found"}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileView
        user={selectedChatData}
        open={showProfile}
        onOpenChange={setShowProfile}
      />
    </motion.div>
  );
};

export default ChatHeader;