import React from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogOut, Settings, UserCircle2 } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useStore();

  const handleLogOut = async () => {
    try {
      const request = await apiClient.post(
        "/api/auth/logout",
        {},
        { withCredentials: true }
      );
      if (request.status === 200) {
        navigate("/login");
        setUserInfo(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const imageUrl = userInfo.image? userInfo.image : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 flex items-center gap-4 bg-gradient-to-r from-dark-accent/10 to-transparent backdrop-blur-sm"
    >
      <motion.div whileHover={{ scale: 1.05 }} className="relative">
        <Avatar className="h-10 w-10 ring-2 ring-blue-500/30 transition-all duration-300 shadow-glow">
          {imageUrl ? (
            <AvatarImage
              src={imageUrl}
              alt="Profile"
              className="object-cover"
            />
          ) : (
            <UserCircle2 className="text-dark-muted" />
          )}
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-dark-primary shadow-glow" />
      </motion.div>

      <div className="flex-1 min-w-0">
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-medium text-dark-text truncate bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text"
        >
          {userInfo?.firstName && userInfo?.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : userInfo?.email}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-dark-muted truncate"
        >
          Online
        </motion.p>
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-dark-muted hover:text-blue-400 hover:bg-dark-accent/30 transition-colors"
                onClick={() => navigate("/profile")}
              >
                <Settings size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-dark-muted hover:text-red-400 hover:bg-dark-accent/30 transition-colors"
                onClick={handleLogOut}
              >
                <LogOut size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Log Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
};

export default ProfileInfo;