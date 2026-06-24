import type { AppState } from '../types/index.js';
import type { AppNotification } from '../types/notification.js';
import type { Store } from '../utils/store.js';
import {
  formatTimestamp,
  getNotifIcon,
  getNotifColor,
} from '../utils/notifications.js';

export class NotificationDrawerComponent {
  private store: Store<AppState>;
  private root: HTMLElement;
  private unsubs: Array<() => void> = [];

  constructor(store: Store<AppState>) {
    this.store = store;
    this.root = this.buildDrawer();
    this.bindStoreUpdates();
  }

  private buildDrawer(): HTMLElement {
    const { notifications, notifOpen } = this.store.getState();
    const unread = notifications.filter((n) => !n.read).length;

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = `notif-drawer-overlay${notifOpen ? ' notif-drawer-overlay--open' : ''}`;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () =>
      this.store.setState({ notifOpen: false })
    );

    // Drawer
    const drawer = document.createElement('div');
    drawer.className = `notif-drawer${notifOpen ? ' notif-drawer--open' : ''}`;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Notificaciones');
    drawer.setAttribute('aria-modal', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'notif-drawer__header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'notif-drawer__title-group';

    const title = document.createElement('h2');
    title.className = 'notif-drawer__title';
    title.textContent = 'Notificaciones';

    if (unread > 0) {
      const badge = document.createElement('span');
      badge.className = 'notif-drawer__header-badge';
      badge.textContent = String(unread);
      titleGroup.appendChild(title);
      titleGroup.appendChild(badge);
    } else {
      titleGroup.appendChild(title);
    }

    const headerActions = document.createElement('div');
    headerActions.className = 'notif-drawer__header-actions';

    if (unread > 0) {
      const markAllBtn = document.createElement('button');
      markAllBtn.className = 'notif-drawer__mark-all';
      markAllBtn.textContent = 'Marcar todas como leídas';
      markAllBtn.addEventListener('click', () => {
        const updated = this.store
          .getState()
          .notifications.map((n) => ({ ...n, read: true }));
        this.store.setState({ notifications: updated });
      });
      headerActions.appendChild(markAllBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notif-drawer__close';
    closeBtn.setAttribute('aria-label', 'Cerrar notificaciones');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.addEventListener('click', () =>
      this.store.setState({ notifOpen: false })
    );
    headerActions.appendChild(closeBtn);

    header.appendChild(titleGroup);
    header.appendChild(headerActions);
    drawer.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'notif-drawer__body';

    if (notifications.length === 0) {
      body.appendChild(this.buildEmpty());
    } else {
      notifications
        .slice()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .forEach((n) => body.appendChild(this.buildItem(n)));
    }

    drawer.appendChild(body);

    const wrapper = document.createElement('div');
    wrapper.className = 'notif-drawer__wrapper';
    wrapper.appendChild(overlay);
    wrapper.appendChild(drawer);

    return wrapper;
  }

  private buildEmpty(): HTMLElement {
    const empty = document.createElement('div');
    empty.className = 'notif-drawer__empty';
    empty.innerHTML = `
      <svg class="notif-drawer__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      <p class="notif-drawer__empty-text">Sin notificaciones</p>
      <p class="notif-drawer__empty-sub">Te avisaremos cuando haya novedades.</p>
    `;
    return empty;
  }

  private buildItem(notif: AppNotification): HTMLElement {
    const item = document.createElement('div');
    item.className = `notif-drawer__item${notif.read ? '' : ' notif-drawer__item--unread'}`;
    item.setAttribute('role', 'listitem');

    // Icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'notif-drawer__item-icon';
    iconWrap.style.setProperty('--notif-color', getNotifColor(notif.type));
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.innerHTML = getNotifIcon(notif.type);

    // Content
    const content = document.createElement('div');
    content.className = 'notif-drawer__item-content';

    const itemTitle = document.createElement('p');
    itemTitle.className = 'notif-drawer__item-title';
    itemTitle.textContent = notif.title;

    const itemMsg = document.createElement('p');
    itemMsg.className = 'notif-drawer__item-message';
    itemMsg.textContent = notif.message;

    const itemTime = document.createElement('span');
    itemTime.className = 'notif-drawer__item-time';
    itemTime.textContent = formatTimestamp(notif.timestamp);

    content.appendChild(itemTitle);
    content.appendChild(itemMsg);
    content.appendChild(itemTime);

    // Unread dot
    const dot = document.createElement('div');
    dot.className = 'notif-drawer__item-dot';
    dot.setAttribute('aria-hidden', 'true');

    item.appendChild(iconWrap);
    item.appendChild(content);
    if (!notif.read) item.appendChild(dot);

    // Mark as read on click
    item.addEventListener('click', () => {
      if (!notif.read) {
        const updated = this.store
          .getState()
          .notifications.map((n) =>
            n.id === notif.id ? { ...n, read: true } : n
          );
        this.store.setState({ notifications: updated });
      }
    });

    return item;
  }

  private rebuild(): void {
    const newDrawer = this.buildDrawer();
    this.root.replaceWith(newDrawer);
    this.root = newDrawer;
  }

  private bindStoreUpdates(): void {
    const u1 = this.store.subscribe('notifications', () => this.rebuild());
    const u2 = this.store.subscribe('notifOpen', () => this.rebuild());
    this.unsubs.push(u1, u2);
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
