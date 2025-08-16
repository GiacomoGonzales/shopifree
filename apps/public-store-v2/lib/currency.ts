// Definición de símbolos de monedas
export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NOK: 'kr',
  MXN: 'MX$',
  INR: '₹',
  NZD: 'NZ$',
  SGD: 'S$',
  ZAR: 'R',
  HKD: 'HK$',
  BRL: 'R$',
  KRW: '₩',
  TRY: '₺',
  RUB: '₽',
  PLN: 'zł',
  THB: '฿',
  CZK: 'Kč',
  DKK: 'kr',
  HUF: 'Ft',
  ILS: '₪',
  CLP: 'CL$',
  PHP: '₱',
  AED: 'د.إ',
  COP: 'CO$',
  SAR: 'ر.س',
  MYR: 'RM',
  RON: 'lei',
  PEN: 'S/', // Perú - Soles
  ARS: 'AR$', // Argentina
  BOB: 'Bs', // Bolivia
  UYU: 'UY$', // Uruguay
  PYG: '₲', // Paraguay
  VES: 'Bs.S', // Venezuela
  CRC: '₡', // Costa Rica
  GTQ: 'Q', // Guatemala
  HNL: 'L', // Honduras
  NIO: 'C$', // Nicaragua
  PAB: 'B/.', // Panamá
  SVC: '$', // El Salvador (usa USD)
  DOP: 'RD$', // República Dominicana
  JMD: 'J$', // Jamaica
  TTD: 'TT$', // Trinidad y Tobago
  BZD: 'BZ$', // Belice
  HTG: 'G', // Haití
  AWG: 'ƒ', // Aruba
  BMD: '$', // Bermuda
  KYD: '$', // Islas Caimán
  XCD: '$', // Caribe Oriental
};

// Nombres de monedas para mostrar
export const currencyNames: Record<string, string> = {
  USD: 'Dólares',
  EUR: 'Euros',
  GBP: 'Libras',
  JPY: 'Yenes',
  AUD: 'Dólares Australianos',
  CAD: 'Dólares Canadienses',
  CHF: 'Francos Suizos',
  CNY: 'Yuan Chino',
  SEK: 'Coronas Suecas',
  NOK: 'Coronas Noruegas',
  MXN: 'Pesos Mexicanos',
  INR: 'Rupias Indias',
  NZD: 'Dólares Neozelandeses',
  SGD: 'Dólares de Singapur',
  ZAR: 'Rand Sudafricano',
  HKD: 'Dólares de Hong Kong',
  BRL: 'Reales Brasileños',
  KRW: 'Won Coreano',
  TRY: 'Liras Turcas',
  RUB: 'Rublos Rusos',
  PLN: 'Zloty Polaco',
  THB: 'Baht Tailandés',
  CZK: 'Corona Checa',
  DKK: 'Corona Danesa',
  HUF: 'Forint Húngaro',
  ILS: 'Shekel Israelí',
  CLP: 'Pesos Chilenos',
  PHP: 'Pesos Filipinos',
  AED: 'Dirham de EAU',
  COP: 'Pesos Colombianos',
  SAR: 'Riyal Saudí',
  MYR: 'Ringgit Malayo',
  RON: 'Leu Rumano',
  PEN: 'Soles', // Perú
  ARS: 'Pesos Argentinos',
  BOB: 'Bolivianos',
  UYU: 'Pesos Uruguayos',
  PYG: 'Guaraníes',
  VES: 'Bolívares',
  CRC: 'Colones',
  GTQ: 'Quetzales',
  HNL: 'Lempiras',
  NIO: 'Córdobas',
  PAB: 'Balboas',
  SVC: 'Dólares',
  DOP: 'Pesos Dominicanos',
  JMD: 'Dólares Jamaiquinos',
  TTD: 'Dólares de Trinidad',
  BZD: 'Dólares de Belice',
  HTG: 'Gourdes',
  AWG: 'Florines de Aruba',
  BMD: 'Dólares de Bermuda',
  KYD: 'Dólares de Islas Caimán',
  XCD: 'Dólares del Caribe Oriental',
};

/**
 * Formatea un precio con la moneda especificada
 * @param amount - El monto a formatear
 * @param currency - El código de moneda (ISO 4217)
 * @param showDecimals - Si mostrar decimales (por defecto true)
 * @returns El precio formateado con el símbolo de moneda
 */
export function formatPrice(
  amount: number | string,
  currency: string = 'USD',
  showDecimals: boolean = true
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol} 0${showDecimals ? '.00' : ''}`;
  }
  
  const symbol = currencySymbols[currency] || '$';
  const formattedAmount = showDecimals 
    ? numericAmount.toFixed(2)
    : Math.round(numericAmount).toString();
  
  return `${symbol} ${formattedAmount}`;
}

/**
 * Obtiene el símbolo de una moneda
 * @param currency - El código de moneda (ISO 4217)
 * @returns El símbolo de la moneda
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  return currencySymbols[currency] || '$';
}

/**
 * Obtiene el nombre de una moneda
 * @param currency - El código de moneda (ISO 4217)
 * @returns El nombre de la moneda
 */
export function getCurrencyName(currency: string = 'USD'): string {
  return currencyNames[currency] || 'Dólares';
}
