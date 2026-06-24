export type NotificationType =
  | 'account_approved'
  | 'order'
  | 'review'
  | 'stock_alert'
  | 'promo';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
