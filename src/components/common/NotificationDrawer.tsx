import React, { useState } from 'react';
import { X, AlertTriangle, Info, BellRing, CheckCheck, Check, Filter } from 'lucide-react';
import { AppNotification } from '../../types';
import { useLanguage } from '../../services/i18n';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNotificationClick: (notif: AppNotification) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const { t } = useLanguage();
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayedNotifications = filterMode === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-sm">
                  {t('notificationsTitle', 'Disaster Notifications & Alerts')}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  {unreadCount > 0 ? (
                    <span className="text-amber-700 font-bold">
                      {unreadCount} {t('unread', 'Unread')}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      All caught up
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              aria-label="Close notification drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Bar: Tabs + Mark All As Read */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('allAlerts', 'All Alerts')} ({notifications.length})
              </button>
              <button
                onClick={() => setFilterMode('unread')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filterMode === 'unread'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('unread', 'Unread')} ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                id="mark-all-notifications-read-btn"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:bg-sky-50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t('markAllRead', 'Mark all as read')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs px-4">
              <CheckCheck className="w-10 h-10 mx-auto mb-3 text-emerald-500/60" />
              <p className="font-semibold text-slate-700">
                {filterMode === 'unread'
                  ? t('noUnreadAlerts', 'No unread alerts. You are up to date!')
                  : t('noAlerts', 'No new alerts. All systems operational.')}
              </p>
              {filterMode === 'unread' && notifications.length > 0 && (
                <button
                  onClick={() => setFilterMode('all')}
                  className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {t('allAlerts', 'View All Alerts')}
                </button>
              )}
            </div>
          ) : (
            displayedNotifications.map((n) => {
              const isEmergency = n.type === 'emergency';
              const isWarning = n.type === 'warning';
              const isUnread = !n.isRead;

              return (
                <div
                  key={n.id}
                  id={`notif-${n.id}`}
                  className={`relative p-3.5 rounded-xl border text-xs transition-all ${
                    isUnread
                      ? isEmergency
                        ? 'bg-red-50/90 border-red-300 shadow-2xs'
                        : isWarning
                        ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                        : 'bg-sky-50/70 border-sky-200 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/90 opacity-80'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                  )}

                  <div
                    onClick={() => {
                      if (onMarkAsRead && isUnread) onMarkAsRead(n.id);
                      onNotificationClick(n);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-bold mb-1.5 pr-4">
                      <span className="flex items-center gap-1.5">
                        {isEmergency ? (
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className={isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'}>
                          {n.title}
                        </span>
                      </span>
                    </div>
                    <p className={`leading-relaxed ${isUnread ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                  </div>

                  {/* Notification footer with timestamp and mark as read action */}
                  <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">{n.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onMarkAsRead) onMarkAsRead(n.id);
                          }}
                          className="px-2 py-0.5 rounded text-sky-700 hover:text-sky-900 hover:bg-sky-100/60 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 text-sky-600" />
                          <span>{t('markAsRead', 'Mark as read')}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
