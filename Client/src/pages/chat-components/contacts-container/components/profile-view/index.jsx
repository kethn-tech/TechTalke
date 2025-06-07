import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2, Shield, ShieldOff, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/store";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProfileView = ({ user, open, onOpenChange }) => {
  const { userInfo, setUserInfo } = useStore();
  const [isBlocked, setIsBlocked] = useState(() => {
    return userInfo?.blockedUsers?.includes(user?._id) || false;
  });

  const handleBlockUser = async () => {
    try {
      const response = await apiClient.post(`/api/contact/block-user/${user._id}`, {}, { withCredentials: true });
      if (response.status === 200) {
        const updatedBlockedUsers = isBlocked
          ? userInfo.blockedUsers.filter(id => id !== user._id)
          : [...(userInfo.blockedUsers || []), user._id];
        
        setUserInfo({
          ...userInfo,
          blockedUsers: updatedBlockedUsers
        });
        setIsBlocked(!isBlocked);
        toast.success(isBlocked ? 'User unblocked successfully' : 'User blocked successfully');
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error('Failed to block/unblock user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-primary border-dark-accent/30 text-dark-text max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text">Profile Information</DialogTitle>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 p-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-32 w-32 ring-4 ring-blue-500/30 shadow-glow transition-all duration-300">
              {user?.image ? (
                <AvatarImage src={user.image} alt="Profile" className="object-cover" />
              ) : (
                <UserCircle2 className="text-dark-muted w-32 h-32" />
              )}
            </Avatar>
          </motion.div>

          <div className="text-center space-y-4 w-full">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-violet-400 text-transparent bg-clip-text"
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 text-dark-muted"
            >
              <Mail className="w-4 h-4" />
              <p className="text-sm">{user?.email}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 text-dark-muted"
            >
              <Calendar className="w-4 h-4" />
              <p className="text-sm">Joined {new Date(user?.createdAt).toLocaleDateString()}</p>
            </motion.div>
          </div>

          {userInfo._id !== user._id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                className={`mt-4 w-full ${isBlocked ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'hover:bg-dark-accent/30'} text-red-400`}
                onClick={handleBlockUser}
              >
                {isBlocked ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Unblock User
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Block User
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileView;