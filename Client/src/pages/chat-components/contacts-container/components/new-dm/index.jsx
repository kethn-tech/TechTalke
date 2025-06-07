import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import DmDialog from "@/pages/chat-components/contacts-dialog-box/index.jsx";
import { useStore } from "@/store/store";

const NewDm = () => {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const { setSelectedChatData, setSelectedChatType } = useStore();

  const handleSelectContact = (contact) => {
    setSelectedChatData(contact);
    setSelectedChatType("dm");
  };

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenNewContactModal(true)}
              className="p-2 rounded-full hover:bg-dark-accent/30 transition-colors backdrop-blur-sm"
            >
              <UserPlus size={18} className="text-blue-400" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DmDialog
        open={openNewContactModal}
        onOpenChange={setOpenNewContactModal}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
};

export default NewDm;