export type ActivityType = 'COMPRADO' | 'REVIEW';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  productName: string;
  date: string;
  amount?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  initials: string;
  storeCount: number;
  wishlistCount: number;
  ordersCount: number;
  reviewsCount: number;
  recentActivity: ActivityItem[];
}

export type ProfileTab = 'Mi tienda';
