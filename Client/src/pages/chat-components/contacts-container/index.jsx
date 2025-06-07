import React, { useState } from "react";
import NewDm from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";
import { useStore } from "@/store/store";
import DMList from "./components/dm-list/DMList";
import AdminLink from "./components/admin-link";
import { motion } from "framer-motion";
import { MessageSquare, Users, Menu, X } from "lucide-react";

const ContactsContainer = () => {
  const { dmContacts, setDmContacts } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getDMContacts = async () => {
      try {
        const response = await apiClient.get("/api/contact/get-dm-list", {
          withCredentials: true,
        });
        if (response.data.contacts) {
          setDmContacts(response.data.contacts);
        }
      } catch (error) {
        console.error("Error in getDMContacts:", error);
      }
    };
    getDMContacts();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-accent/20 rounded-lg backdrop-blur-sm"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-400" />
        ) : (
          <Menu className="h-6 w-6 text-gray-400" />
        )}
      </button>

      <div
        className={`w-[280px] bg-dark-primary/95 h-screen border-r border-dark-accent/30 backdrop-blur-sm shadow-glow flex flex-col 
          fixed lg:relative lg:translate-x-0 transition-transform duration-300 z-40
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-violet-500/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-primary/80 to-transparent pointer-events-none" />

        <div className="flex-1 overflow-hidden relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center h-16 border-b border-dark-accent/30 bg-dark-accent/5"
          >
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">
              Messages
            </h1>
          </motion.div>

          <div className="px-4 mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-3 mt-4"
            >
              <div className="flex items-center gap-2 text-dark-text/80">
                <MessageSquare size={18} className="text-blue-500" />
                <span className="text-sm font-medium">Direct Messages</span>
              </div>
              <div className="flex items-center gap-2">
                <AdminLink />
                <NewDm />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className=""
            >
              <DMList />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto border-t border-dark-accent/30 bg-dark-accent/5 backdrop-blur-sm relative z-10 "
        >
          <ProfileInfo />
        </motion.div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};

export default ContactsContainer;
