import { motion, AnimatePresence } from 'framer-motion';
import { Check, User } from 'lucide-react';
import { GroupMember } from '@/types/menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GroupMembersBarProps {
  members: GroupMember[];
  currentUserId: string;
}

export function GroupMembersBar({ members, currentUserId }: GroupMembersBarProps) {
  if (members.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full"
    >
      <span className="text-xs text-muted-foreground mr-1">Dining with:</span>
      <div className="flex -space-x-2">
        <AnimatePresence mode="popLayout">
          {members.map((member, index) => (
            <Tooltip key={member.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background shadow-sm"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  {member.id === currentUserId && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center">
                      <User className="w-2 h-2 text-primary" />
                    </div>
                  )}
                  {member.isReady && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {member.name}
                  {member.id === currentUserId && ' (You)'}
                  {member.isReady && ' ✓ Ready'}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
