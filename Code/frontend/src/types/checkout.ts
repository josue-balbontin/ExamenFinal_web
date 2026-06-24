export type PaymentMethod = 'card' | 'qr';

export type CheckoutStep = 'method' | 'details' | 'confirm';

export interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  method: PaymentMethod | null;
  card: CardData | null;
}
