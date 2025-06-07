import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStore } from '@/store/store';

const AdminLink = () => {
  const navigate = useNavigate();
  const { userInfo } = useStore();
  
  // Only render for admin users
  if (!userInfo || userInfo.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-full hover:bg-dark-accent/30 transition-colors backdrop-blur-sm"
            >
              <Shield size={18} className="text-red-400" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Admin Dashboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AdminLink;