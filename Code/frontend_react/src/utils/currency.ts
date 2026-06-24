export function formatPrice(amount?: number): string {
  if (amount == null || isNaN(amount)) return '$0.00';
  const region = localStorage.getItem('region');

  if (!region || region === 'Local') {
    return `$${amount.toFixed(2)}`;
  }

  return `US$${amount.toFixed(2)}`;
}
