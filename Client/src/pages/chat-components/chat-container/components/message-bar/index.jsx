import React, { useEffect, useRef, useState } from "react";
import { Smile, Send, Code } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useStore } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-go";
import "prismjs/themes/prism-tomorrow.css";

const MessageBar = () => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const emojiPickerRef = useRef(null);
  const editorContainerRef = useRef(null);
  const { selectedChatType, selectedChatData, userInfo } = useStore();
  const socket = useSocket();
  const fileInputRef = useRef();

  const handleEmojiClick = (emojiData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleClickOutside = (e) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
      setEmojiPickerOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (socket && message.trim() !== "") {
      socket.emit("sendMessage", {
        sender: userInfo._id,
        recipient: selectedChatData._id,
        content: message.trim(),
        messageType: isCodeMode ? "code" : "text",
        language: isCodeMode ? language : undefined,
      });
      setMessage("");
      setIsCodeMode(false);
    }
  };

  const toggleCodeMode = () => {
    setIsCodeMode(!isCodeMode);
    if (!isCodeMode) {
      setMessage("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCodeMode && editorContainerRef.current) {
      editorContainerRef.current.scrollTop =
        editorContainerRef.current.scrollHeight;
    }
  }, [message, isCodeMode]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 bg-[#1a1b1e]/95 backdrop-blur-xl border-t border-[#2a2b2e] relative z-10"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-[#2a2b2e] rounded-xl p-2">
          <div className="flex items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-[#3a3b3e] w-9 h-9 rounded-lg hidden sm:flex"
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              >
                <Smile size={20} />
              </Button>
              <div className="absolute bottom-12 left-0" ref={emojiPickerRef}>
                <AnimatePresence>
                  {emojiPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="shadow-2xl"
                    >
                      <EmojiPicker
                        theme="dark"
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        skinTonesDisabled
                        searchDisabled
                        previewConfig={{ showPreview: false }}
                        width={320}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`text-gray-400 hover:text-white w-9 h-9 rounded-lg ${
                isCodeMode ? "bg-[#3a3b3e] text-indigo-400" : ""
              }`}
              onClick={toggleCodeMode}
            >
              <Code size={20} />
            </Button>
          </div>

          <div className="flex-1">
            {isCodeMode ? (
              <div
                ref={editorContainerRef}
                style={{
                  overflowY: "auto",
                  maxHeight: "200px",
                  minHeight: "60px",
                }}
                className="w-full bg-[#1a1b1e] rounded-lg"
              >
                <Editor
                  value={message}
                  onValueChange={setMessage}
                  highlight={(code) => highlight(code, languages[language])}
                  padding={12}
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "#f1f1f1",
                  }}
                  preClassName={`language-${language} custom-scrollbar`}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  placeholder="Type your code here..."
                  className="bg-[#1a1b1e] border-0 text-gray-100 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-indigo-500/20 rounded-lg py-2.5"
                />
              </div>
            ) : (
              <Input
                type="text"
                placeholder="Type a message..."
                className="w-full bg-[#1a1b1e] border-0 text-gray-100 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-indigo-500/20 rounded-lg py-2.5"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                autoFocus
              />
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`w-9 h-9 rounded-lg ${
                message.trim()
                  ? "text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                  : "text-gray-400 hover:text-white hover:bg-[#3a3b3e]"
              }`}
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBar;