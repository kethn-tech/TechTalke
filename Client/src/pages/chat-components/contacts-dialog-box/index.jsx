import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";

const DmDialog = ({ open, onOpenChange, onSelectContact }) => {
  const [searchedContacts, setSearchedContacts] = useState([]);

  const searchContact = async (searchTerm) => {
    try {
      const response = await apiClient.post(
        "api/contact/search",
        { searchTerm },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.contacts) {
        setSearchedContacts(response.data.contacts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // When the dialog opens, load contacts (you can adjust this behavior)
  useEffect(() => {
    if (open) {
      searchContact("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-secondary border border-dark-accent/30 text-dark-text sm:max-w-[425px] animate-fadeIn backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus size={20} className="text-blue-400" />
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted"
            size={18}
          />
          <Input
            className="pl-10 bg-dark-accent/30 border-dark-accent/30 text-dark-text placeholder:text-dark-muted"
            placeholder="Search users..."
            onChange={(e) => searchContact(e.target.value)}
          />
        </div>

        <ScrollArea className="mt-4 max-h-[300px] pr-4">
          <AnimatePresence>
            {searchedContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  onSelectContact(contact);
                  onOpenChange(false); // Close dialog after selecting
                  setSearchedContacts([]);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-accent/30 cursor-pointer group transition-colors backdrop-blur-sm"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-dark-text group-hover:text-blue-400 transition-colors">
                    {contact.firstName && contact.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : "No Name"}
                  </h4>
                  <p className="text-sm text-dark-muted">{contact.email}</p>
                </div>
                <Plus
                  size={18}
                  className="text-dark-muted opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {searchedContacts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-dark-muted"
            >
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DmDialog;