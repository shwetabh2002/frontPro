/**
 * Currency utility functions for formatting and symbol mapping
 */

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CNY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'TRY': '₺',
  'ZAR': 'R',
  'BRL': 'R$',
  'MXN': '$',
  'ARS': '$',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'UYU': '$U',
  'VES': 'Bs',
  'KRW': '₩',
  'THB': '฿',
  'SGD': 'S$',
  'MYR': 'RM',
  'IDR': 'Rp',
  'PHP': '₱',
  'VND': '₫',
  'HKD': 'HK$',
  'TWD': 'NT$',
  'NZD': 'NZ$',
  'FJD': 'FJ$',
  
  // Middle East currencies
  'SAR': 'ر.س', // Saudi Riyal
  'AED': 'د.إ', // UAE Dirham
  'QAR': 'ر.ق', // Qatari Riyal
  'KWD': 'د.ك', // Kuwaiti Dinar
  'BHD': 'د.ب', // Bahraini Dinar
  'OMR': 'ر.ع.', // Omani Rial
  'JOD': 'د.ا', // Jordanian Dinar
  'LBP': 'ل.ل', // Lebanese Pound
  'EGP': 'ج.م', // Egyptian Pound
  'IQD': 'د.ع', // Iraqi Dinar
  'IRR': '﷼', // Iranian Rial
  'YER': '﷼', // Yemeni Rial
  'SYP': 'ل.س', // Syrian Pound
  
  // Asian currencies
  'INR': '₹', // Indian Rupee
  'PKR': '₨', // Pakistani Rupee
  'BDT': '৳', // Bangladeshi Taka
  'LKR': '₨', // Sri Lankan Rupee
  'NPR': '₨', // Nepalese Rupee
  'AFN': '؋', // Afghan Afghani
  'KZT': '₸', // Kazakhstani Tenge
  'UZS': 'лв', // Uzbekistan Som
  'KGS': 'лв', // Kyrgyzstani Som
  'TJS': 'SM', // Tajikistani Somoni
  'TMT': 'T', // Turkmenistani Manat
  'MNT': '₮', // Mongolian Tugrik
  
  // African currencies
  'NGN': '₦', // Nigerian Naira
  'KES': 'KSh', // Kenyan Shilling
  'TZS': 'TSh', // Tanzanian Shilling
  'UGX': 'USh', // Ugandan Shilling
  'MAD': 'د.م.', // Moroccan Dirham
  'TND': 'د.ت', // Tunisian Dinar
  'DZD': 'د.ج', // Algerian Dinar
  'LYD': 'ل.د', // Libyan Dinar
  'ETB': 'Br', // Ethiopian Birr
  'GHS': '₵', // Ghanaian Cedi
  'ZMW': 'ZK', // Zambian Kwacha
  'BWP': 'P', // Botswanan Pula
  'SZL': 'L', // Swazi Lilangeni
  'LSL': 'L', // Lesotho Loti
  'NAD': 'N$', // Namibian Dollar
  'MUR': '₨', // Mauritian Rupee
  'MVR': 'ރ', // Maldivian Rufiyaa
  'SCR': '₨', // Seychellois Rupee
  'MWK': 'MK', // Malawian Kwacha
  'ZWL': 'Z$', // Zimbabwean Dollar
  
  // European currencies
  'RON': 'lei', // Romanian Leu
  'BGN': 'лв', // Bulgarian Lev
  'HRK': 'kn', // Croatian Kuna
  'RSD': 'дин', // Serbian Dinar
  'MKD': 'ден', // Macedonian Denar
  'ALL': 'L', // Albanian Lek
  'BAM': 'КМ', // Bosnia-Herzegovina Convertible Mark
  'ISK': 'kr', // Icelandic Króna
  
  // Precious metals
  'XAU': 'Au', // Gold Ounce
  'XAG': 'Ag', // Silver Ounce
  'XPD': 'Pd', // Palladium Ounce
  'XPT': 'Pt', // Platinum Ounce
  
  // Other currencies
  'BTC': '₿', // Bitcoin
  'XDR': 'SDR', // Special Drawing Rights
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code (e.g., 'USD', 'EUR', 'SAR')
 * @returns The currency symbol or the currency code if symbol not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  if (!currencyCode) return '';
  
  const symbol = CURRENCY_SYMBOLS[currencyCode.toUpperCase()];
  return symbol || currencyCode;
}

/**
 * Format price with currency symbol
 * @param price - The price amount
 * @param currencyCode - The currency code
 * @param locale - The locale for number formatting (default: 'en-US')
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(price: number, currencyCode: string, locale: string = 'en-US'): string {
  if (price === undefined || price === null || isNaN(price)) return '';
  
  const symbol = getCurrencySymbol(currencyCode);
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  
  // For RTL currencies (Arabic), put symbol after the number
  const isRTL = ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'IQD', 'IRR', 'YER', 'SYP'].includes(currencyCode.toUpperCase());
  
  return isRTL ? `${formattedNumber} ${symbol}` : `${symbol}${formattedNumber}`;
}

/**
 * Get currency display name with symbol
 * @param currencyCode - The currency code
 * @param currencyName - The currency name
 * @returns Formatted currency display string
 */
export function getCurrencyDisplay(currencyCode: string, currencyName: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${currencyCode} (${symbol}) - ${currencyName}`;
}

/**
 * Check if currency code is RTL (Right-to-Left)
 * @param currencyCode - The currency code
 * @returns True if currency is RTL
 */
export function isRTLCurrency(currencyCode: string): boolean {
  const rtlCurrencies = ['SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'IQD', 'IRR', 'YER', 'SYP'];
  return rtlCurrencies.includes(currencyCode.toUpperCase());
}

/**
 * Format currency amount with symbol
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: 'USD')
 * @param locale - The locale for number formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD', locale: string = 'en-US'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  const symbol = getCurrencySymbol(currencyCode);
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  // For RTL currencies (Arabic), put symbol after the number
  const isRTL = isRTLCurrency(currencyCode);
  
  return isRTL ? `${formattedNumber} ${symbol}` : `${symbol}${formattedNumber}`;
}
