import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Code, Zap, ArrowRight } from "lucide-react";
import DmDialog from "@/pages/chat-components/contacts-dialog-box/index.jsx";
import { useStore } from "@/store/store";

const EmptyChatContainer = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const { setSelectedChatData, setSelectedChatType } = useStore();

  const handleSelectContact = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Real-time Messaging",
      description: "Experience instant communication with zero lag",
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Code Snippet Sharing",
      description: "Send and receive code snippets directly in the chat",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: (
        <span className="flex items-center gap-2">
          Group Chat Feature
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-semibold px-2 py-1 rounded-md shadow-glow-sm"
          >
            Coming Soon
          </motion.span>
        </span>
      ),
      description: "Connect with multiple users in a single chat room",
    },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.08),transparent_50%)]" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 h-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center h-full space-y-12"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold tracking-tight"
            >
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 text-transparent bg-clip-text animate-gradient">
                TechTalke
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-400"
            >
              Start a conversation, connect with others, and experience
              communication reimagined
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-glow"
              onClick={() => setOpenNewContactModal(true)}
            >
              Start Chatting
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
                whileHover={{ scale: 1.02, translateY: -5 }}
                className="bg-dark-accent/10 backdrop-blur-sm p-6 rounded-xl border border-dark-accent/30 hover:border-blue-500/50 transition-all duration-300 shadow-glow-sm group"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-lg w-fit mb-4 group-hover:from-blue-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <DmDialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default EmptyChatContainer;