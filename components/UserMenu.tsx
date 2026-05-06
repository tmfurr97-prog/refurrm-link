import React from 'react';
import { LogOut, Github, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { loginWithGoogle, loginWithGithub, logout } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

export const UserMenu: React.FC = () => {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredProvider, setHoveredProvider] = React.useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/50 border border-white/10">
        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
      >
        <div className="h-7 w-7 rounded-full overflow-hidden border border-white/20">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-violet-500/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-violet-400" />
            </div>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-300 font-bold max-w-[100px] truncate uppercase tracking-widest">
          {user.displayName?.split(' ')[0] || 'User'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 z-50 glass-panel rounded-2xl border border-white/10 p-2 shadow-2xl"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs font-mono uppercase"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
