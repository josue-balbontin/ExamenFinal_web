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
    phone: user.phone ?? '+123 456 789',
    location: user.address ?? 'ubicacion',
    memberSince: 'March 2023',
    initials,
    storeCount: 5,
    wishlistCount: 3,
    ordersCount: 34,
    reviewsCount: 0,
    recentActivity: [
      {
        id: '1',
        type: 'COMPRADO',
        productName: 'nombre producto',
        date: 'Jun 18, 2026',
        amount: 314.99,
      },
      {
        id: '2',
        type: 'REVIEW',
        productName: 'nombre producto',
        date: 'May 15, 2026',
      },
      {
        id: '3',
        type: 'COMPRADO',
        productName: 'nombre producto',
        date: 'May 3, 2026',
        amount: 989.1,
      },
      {
        id: '4',
        type: 'COMPRADO',
        productName: 'nombre producto',
        date: 'Apr 22, 2026',
        amount: 116.99,
      },
    ],
  };
}
