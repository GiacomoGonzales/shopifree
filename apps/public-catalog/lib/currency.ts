const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  MXN: '$',
  COP: '$',
  ARS: '$',
  CLP: '$',
  PEN: 'S/',
  BRL: 'R$',
  UYU: '$',
  PYG: '₲',
  BOB: 'Bs',
  VES: 'Bs',
  GTQ: 'Q',
  CRC: '₡',
  NIO: 'C$',
  PAB: 'B/.',
  DOP: 'RD$',
  HNL: 'L',
};

export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbol = currencySymbols[currency] || '$';
  return `${symbol} ${price.toFixed(2)}`;
}
