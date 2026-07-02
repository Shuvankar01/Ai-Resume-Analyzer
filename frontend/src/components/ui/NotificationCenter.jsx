import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, CheckSquare } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const typeLabels = {
    success: 'Success',
    error: 'Alert',
    warning: 'Warning',
    info: 'System'
  };

  const typeColors = {
    success: 'text-emerald-400 bg-emerald-500/10',
    error: 'text-rose-400 bg-rose-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    info: 'text-[var(--accent)] bg-[var(--accent)]/10'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl border transition-all duration-300 hover:bg-white/5 active:scale-95
          ${isOpen ? 'border-[var(--primary)] text-white bg-[var(--primary)]/10' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-white'}
        `}
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-[#05050A] shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-80 max-h-[480px] card-glass rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-white/[0.01]">
              <div>
                <h4 className="text-sm font-black text-white tracking-tight">Notifications</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-bold">
                  {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white/20 transition-all active:scale-95"
                  >
                    <CheckSquare size={14} />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)] max-h-[320px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell size={28} className="mx-auto text-white/10" />
                  <p className="text-xs text-[var(--text-muted)] font-medium">All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 flex gap-3 transition-colors relative group
                      ${notif.isRead ? 'hover:bg-white/[0.02]' : 'bg-[var(--primary)]/[0.02] hover:bg-[var(--primary)]/[0.04]'}
                    `}
                  >
                    {/* Unread Ring indicator */}
                    {!notif.isRead && (
                      <span className="absolute left-2 top-[22px] w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}

                    {/* Left Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 shrink-0 ${typeColors[notif.type]}`}>
                      <span className="text-xs font-black uppercase text-[10px] tracking-tight">{typeLabels[notif.type][0]}</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                          {typeLabels[notif.type]}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold whitespace-nowrap">
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>
                      <p className={`text-xs leading-normal break-words ${notif.isRead ? 'text-gray-400 font-medium' : 'text-white font-bold'}`}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Action Mark Read */}
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-1 rounded bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 self-center border border-white/10"
                        title="Mark as read"
                      >
                        <Check size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
