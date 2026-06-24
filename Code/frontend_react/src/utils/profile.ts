import type { UserProfile } from '../types/profiles.ts';
import type { User } from '../types/index.js';

export function buildUserProfile(user: User): UserProfile {
  const name =
    [user.name, user.lastName].filter(Boolean).join(' ') || 'nombre usuario';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return {
    name,
    email: user.email,
    phone: user.phone ?? 'No especificado',
    location: user.address ?? 'No especificada',
    memberSince: user.memberSince ?? 'Reciente',
    initials,
    storeCount: 0,
    wishlistCount: 0,
    ordersCount: 0,
    reviewsCount: 0,
    recentActivity: [],
  };
}
