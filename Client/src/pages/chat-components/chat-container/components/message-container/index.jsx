import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import apiClient from "@/lib/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/themes/prism-tomorrow.css";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Check, AlertTriangle } from "lucide-react";

const MessageContainer = () => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showActions, setShowActions] = useState({});
  const [activeMessageId, setActiveMessageId] = useState(null);

  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    selectedChatMessages,
    setSelectedChatMessages,
  } = useStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check if device is mobile/touch
  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const scrollToBottom = () => {
    setIsScrolling(true);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  const fetchMessages = async () => {
    try {
      const res = await apiClient.post(
        "/api/message/get-messages",
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (res.data.chat) {
        setSelectedChatMessages(res.data.chat);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages]);

  useEffect(() => {
    if (selectedChatData) {
      if (selectedChatType === "dm") {
        fetchMessages();
      }
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  const socket = useSocket();

  // Copy message handler
  const handleCopyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setShowActions({}); // Close actions after copy

      toast.success("Message copied!", {
        duration: 2000,
        style: {
          background: "#1f2937",
          color: "#f3f4f6",
          border: "1px solid #10b981",
        },
      });

      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy message", {
        duration: 2000,
        style: {
          background: "#1f2937",
          color: "#f3f4f6",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      socket.emit("deleteMessage", {
        messageId: selectedMessage._id,
        sender: selectedMessage.sender._id,
        recipient: selectedMessage.recipient._id,
      });

      setShowDeleteDialog(false);
      setShowActions({}); // Close actions

      toast.success("Message deleted successfully", {
        duration: 3000,
        style: {
          background: "#1f2937",
          color: "#f3f4f6",
          border: "1px solid #374151",
        },
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message", {
        duration: 3000,
        style: {
          background: "#1f2937",
          color: "#f3f4f6",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const openDeleteDialog = (message) => {
    setSelectedMessage(message);
    setShowDeleteDialog(true);
  };

  // Handle single click for sender messages (show actions)
  const handleSingleClick = (messageId, isSender) => {
    if (isSender) {
      setShowActions((prev) => {
        const newState = {};
        // Close all other actions
        Object.keys(prev).forEach((id) => {
          newState[id] = false;
        });
        // Toggle current message
        newState[messageId] = !prev[messageId];
        return newState;
      });
      setActiveMessageId(messageId);
    }
  };

  // Handle double click for copying (all messages)
  const handleDoubleClick = (messageId, content, e) => {
    e.stopPropagation();
    e.preventDefault();
    handleCopyMessage(messageId, content);
  };

  // Close actions when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !event.target.closest(".message-container") &&
        !event.target.closest(".message-actions")
      ) {
        setShowActions({});
        setActiveMessageId(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const formatMessagePreview = (content) => {
    if (!content) return "Empty message";
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timeStamp).format("DD-MM-YYYY");
      const showDate = lastDate !== messageDate;
      lastDate = messageDate;

      const isSender =
        selectedChatType === "dm"
          ? typeof message.sender === "object"
            ? message.sender._id === userInfo._id
            : message.sender === userInfo._id
          : message.sender._id === userInfo._id;

      const isCopied = copiedMessageId === message._id;
      const actionsVisible = showActions[message._id];

      return (
        <motion.div
          key={message._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {showDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticky top-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-slate-300 py-2 px-4 text-center text-xs rounded-full my-4 backdrop-blur-md z-10 w-fit border border-slate-600/30 shadow-lg"
            >
              {messageDate}
            </motion.div>
          )}

          <div
            className={`flex ${
              isSender ? "justify-end" : "justify-start"
            } w-full my-1 px-2 sm:px-4`}
          >
            <div
              className={`relative max-w-[85%] sm:max-w-[70%] group message-container`}
              onClick={() => handleSingleClick(message._id, isSender)}
              onDoubleClick={(e) =>
                handleDoubleClick(message._id, message.content, e)
              }
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
                cursor: "pointer",
              }}
            >
              {/* ACTION BUTTONS for sender messages */}
              <AnimatePresence>
                {actionsVisible && isSender && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute -top-16 right-1/2 transform translate-x-1/2 z-50 message-actions"
                  >
                    <div className="bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-600/50 p-2 flex items-center gap-2">
                      {/* Copy Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessage(message._id, message.content);
                        }}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 flex items-center justify-center transition-all duration-200 group/btn"
                        title="Copy message"
                      >
                        {isCopied ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Copy
                            size={18}
                            className="text-blue-400 group-hover/btn:text-blue-300"
                          />
                        )}
                      </motion.button>

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(message);
                        }}
                        className="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all duration-200 group/btn"
                        title="Delete message"
                      >
                        <Trash2
                          size={18}
                          className="text-red-400 group-hover/btn:text-red-300"
                        />
                      </motion.button>
                    </div>

                    {/* Arrow pointing down */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800/95"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Bubble */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={`px-3 sm:px-4 py-2.5 rounded-2xl relative overflow-hidden cursor-pointer select-none ${
                  isSender
                    ? message.messageType === "code"
                      ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white border border-slate-700/50"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : message.messageType === "code"
                    ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white border border-slate-600/50"
                    : "bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/25"
                } ${
                  actionsVisible && isSender
                    ? "ring-2 ring-blue-400/40 shadow-xl"
                    : ""
                } hover:shadow-xl transition-all duration-300 break-words word-wrap`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                {/* Sender name for group chats */}
                {selectedChatType === "group" && !isSender && (
                  <div className="text-xs text-slate-300 mb-1 font-medium">
                    {message.sender.firstName} {message.sender.lastName}
                  </div>
                )}

                {/* Visual indicator for copy functionality */}
                <div className="absolute top-2 right-2 opacity-30">
                  {isSender ? (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                      <Copy size={10} className="text-white/40" />
                    </div>
                  ) : (
                    <Copy size={12} className="text-white/40" />
                  )}
                </div>

                {/* Code message rendering */}
                {message.messageType === "code" ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-slate-900/50 px-3 py-2 rounded-lg">
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                        {message.language || "code"}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyMessage(message._id, message.content);
                        }}
                        className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-700/50 flex items-center gap-1"
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} className="text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                    <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words bg-slate-900/30 p-3 rounded-lg max-w-full">
                      <code
                        className="break-all"
                        dangerouslySetInnerHTML={{
                          __html: highlight(
                            message.content,
                            languages[message.language || "javascript"],
                            message.language || "javascript"
                          ),
                        }}
                      />
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm break-words leading-relaxed whitespace-pre-wrap relative z-10 overflow-wrap-anywhere">
                    {message.content}
                  </p>
                )}

                {/* Timestamp */}
                <span className="block text-right text-xs mt-2 text-white/70 font-medium">
                  {moment(message.timeStamp).format("HH:mm")}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-transparent text-dark-text flex flex-col overflow-hidden"
      style={{
        height: "100%",
        minHeight: 0,
        maxHeight: "100%",
      }}
    >
      {/* Messages Section - Proper scrollable container */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(99, 102, 241, 0.5) rgba(31, 41, 55, 0.2)",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          scrollBehavior: "smooth",
        }}
      >
        <div className="flex flex-col space-y-2 min-h-full w-full max-w-full">
          {renderMessages()}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      {/* Delete Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent
              className={`bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 text-slate-100 shadow-2xl backdrop-blur-md ${
                isMobile ? "w-[95vw] max-w-md mx-auto" : "max-w-lg"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-semibold text-slate-100">
                        Delete Message
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-sm">
                        This action cannot be undone
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="py-6">
                  {selectedMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                          {selectedMessage.sender?.firstName?.charAt(0) ||
                            selectedMessage.sender?.email
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-200 truncate">
                            {selectedMessage.sender?.firstName &&
                            selectedMessage.sender?.lastName
                              ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}`
                              : selectedMessage.sender?.email?.split("@")[0] ||
                                "Unknown"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(
                              selectedMessage.timeStamp
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {formatMessagePreview(selectedMessage.content)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <DialogFooter
                  className={`gap-3 ${isMobile ? "flex-col" : "flex-row"}`}
                >
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className={`border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200 ${
                      isMobile ? "w-full" : ""
                    }`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteMessage}
                    className={`bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                      isMobile ? "w-full" : ""
                    }`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageContainer;