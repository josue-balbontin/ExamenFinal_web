import type { AppState } from '../types/index.ts';
import type { Store } from '../utils/store.ts';
import type { Router } from '../utils/router.ts';
import type { ProfileTab } from '../types/profiles.ts';
import { NavbarComponent } from '../components/Navbar.ts';
import { CartDrawerComponent } from '../components/CartDrawer.ts';
import { buildUserProfile } from '../utils/profile.ts';
import { MyStoreTabComponent } from '../components/MyStoreTab.js';
import { EditProfileModalComponent } from '../components/EditProfileModal.js';

export function createProfilePage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  if (!store.getState().auth.isAuthenticated) {
    router.navigate('/login');
    return document.createElement('div');
  }

  store.setState({ cartOpen: false });

  const user = store.getState().auth.user!;
  const profile = buildUserProfile(user);

  let activeTab: ProfileTab = 'Mi tienda';

  const page = document.createElement('div');
  page.className = 'profile-page';

  // Navbar
  page.appendChild(new NavbarComponent(store, router).getElement());

  const content = document.createElement('div');
  content.className = 'profile-page__content';

  // ── Header card ──
  const headerCard = document.createElement('div');
  headerCard.className = 'profile-header';

  const avatarEl = document.createElement('div');
  avatarEl.className = 'profile-header__avatar';
  avatarEl.textContent = profile.initials;
  avatarEl.setAttribute('aria-hidden', 'true');

  const nameEl = document.createElement('h1');
  nameEl.className = 'profile-header__name';
  nameEl.textContent = profile.name;

  const avatarGroup = document.createElement('div');
  avatarGroup.className = 'profile-header__avatar-group';
  avatarGroup.appendChild(avatarEl);
  avatarGroup.appendChild(nameEl);

  const editBtn = document.createElement('button');
  editBtn.className = 'profile-header__edit-btn';
  editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar Perfil`;
  editBtn.addEventListener('click', () => {
    const modal = new EditProfileModalComponent(store, () => {
      // Re-render la página al cerrar para reflejar los cambios
      router.navigate('/profile');
    });
    document.body.appendChild(modal.getElement());
  });

  const topRow = document.createElement('div');
  topRow.className = 'profile-header__top-row';
  topRow.appendChild(avatarGroup);
  topRow.appendChild(editBtn);

  const metaRow = document.createElement('div');
  metaRow.className = 'profile-header__meta';

  const metaItems = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
      text: profile.email,
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>`,
      text: profile.phone,
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      text: profile.location,
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      text: `Member since ${profile.memberSince}`,
    },
  ];

  metaItems.forEach(({ icon, text }) => {
    const item = document.createElement('div');
    item.className = 'profile-header__meta-item';
    item.innerHTML = icon;
    const span = document.createElement('span');
    span.textContent = text;
    item.appendChild(span);
    metaRow.appendChild(item);
  });

  headerCard.appendChild(topRow);
  headerCard.appendChild(metaRow);
  content.appendChild(headerCard);

  const tabs: ProfileTab[] = ['Mi tienda'];

  const tabBar = document.createElement('div');
  tabBar.className = 'profile-tabs';
  tabBar.setAttribute('role', 'tablist');

  const tabPanelWrapper = document.createElement('div');
  tabPanelWrapper.className = 'profile-tabs__panel';

  function renderTabContent(): void {
    tabPanelWrapper.innerHTML = '';

    if (activeTab === 'Mi tienda') {
      const myStore = new MyStoreTabComponent();
      tabPanelWrapper.appendChild(myStore.getElement());
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'profile-tabs__placeholder';
      placeholder.textContent = `Contenido de "${activeTab}" próximamente.`;
      tabPanelWrapper.appendChild(placeholder);
    }
  }

  tabs.forEach((tab) => {
    const btn = document.createElement('button');
    btn.className = `profile-tabs__tab${tab === activeTab ? ' profile-tabs__tab--active' : ''}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(tab === activeTab));
    btn.textContent = tab;

    btn.addEventListener('click', () => {
      activeTab = tab;
      tabBar.querySelectorAll('.profile-tabs__tab').forEach((el, i) => {
        el.classList.toggle('profile-tabs__tab--active', tabs[i] === tab);
        el.setAttribute('aria-selected', String(tabs[i] === tab));
      });
      renderTabContent();
    });

    tabBar.appendChild(btn);
  });

  content.appendChild(tabBar);
  renderTabContent();
  content.appendChild(tabPanelWrapper);

  page.appendChild(content);
  page.appendChild(new CartDrawerComponent(store, router).getElement());

  return page;
}
