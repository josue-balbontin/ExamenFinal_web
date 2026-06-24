import React from 'react';
import type { AppNotification } from '../types/notification';
import { useStore, globalStore } from '../storeInstance';
import { formatTimestamp, getNotifIcon, getNotifColor } from '../utils/notifications';

export const NotificationDrawer: React.FC = () => {
  const { notifications, notifOpen } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  const handleClose = () => {
    globalStore.setState({ notifOpen: false });
  };

  const handleMarkAll = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    globalStore.setState({ notifications: updated });
  };

  const handleItemClick = (notif: AppNotification) => {
    if (!notif.read) {
      const updated = notifications.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      );
      globalStore.setState({ notifications: updated });
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="notif-drawer__wrapper">
      <div
        className={`notif-drawer-overlay${notifOpen ? ' notif-drawer-overlay--open' : ''}`}
        aria-hidden="true"
        onClick={handleClose}
      />
      <div
        className={`notif-drawer${notifOpen ? ' notif-drawer--open' : ''}`}
        role="dialog"
        aria-label="Notificaciones"
        aria-modal="true"
      >
        <div className="notif-drawer__header">
          <div className="notif-drawer__title-group">
            <h2 className="notif-drawer__title">Notificaciones</h2>
            {unread > 0 && <span className="notif-drawer__header-badge">{unread}</span>}
          </div>
          <div className="notif-drawer__header-actions">
            {unread > 0 && (
              <button className="notif-drawer__mark-all" onClick={handleMarkAll}>
                Marcar todas como leídas
              </button>
            )}
            <button
              className="notif-drawer__close"
              aria-label="Cerrar notificaciones"
              onClick={handleClose}
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
              }}
            />
          </div>
        </div>

        <div className="notif-drawer__body">
          {notifications.length === 0 ? (
            <div className="notif-drawer__empty">
              <svg
                className="notif-drawer__empty-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <p className="notif-drawer__empty-text">Sin notificaciones</p>
              <p className="notif-drawer__empty-sub">
                Te avisaremos cuando haya novedades.
              </p>
            </div>
          ) : (
            sortedNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-drawer__item${notif.read ? '' : ' notif-drawer__item--unread'}`}
                role="listitem"
                onClick={() => handleItemClick(notif)}
              >
                <div
                  className="notif-drawer__item-icon"
                  style={{ '--notif-color': getNotifColor(notif.type) } as React.CSSProperties}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: getNotifIcon(notif.type) }}
                />
                <div className="notif-drawer__item-content">
                  <p className="notif-drawer__item-title">{notif.title}</p>
                  <p className="notif-drawer__item-message">{notif.message}</p>
                  <span className="notif-drawer__item-time">
                    {formatTimestamp(notif.timestamp)}
                  </span>
                </div>
                {!notif.read && (
                  <div className="notif-drawer__item-dot" aria-hidden="true" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
