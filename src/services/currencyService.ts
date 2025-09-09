import { httpClient } from '../utils/apiUtils';
import { APP_CONSTANTS } from '../constants';

export interface Currency {
  code: string;
  name: string;
}

export interface CurrenciesResponse {
  [code: string]: string;
}

class CurrencyService {
  private readonly CURRENCIES_API_URL = `${APP_CONSTANTS.EXTERNAL_APIS.OPENEXCHANGERATES.BASE_URL}/currencies.json`;
  private readonly APP_ID = APP_CONSTANTS.EXTERNAL_APIS.OPENEXCHANGERATES.APP_ID;
  private readonly CACHE_KEY = 'currencies_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetch currencies from OpenExchangeRates API
   * Uses caching to avoid excessive API calls
   */
  public async getCurrencies(): Promise<Currency[]> {
    try {
      console.log('🔄 CurrencyService: Checking cache...');
      // Check cache first
      const cachedData = this.getCachedCurrencies();
      if (cachedData) {
        console.log('✅ CurrencyService: Using cached data:', cachedData.length, 'currencies');
        return cachedData;
      }

      console.log('🌐 CurrencyService: Fetching from API...');
      // Fetch from API
      const response = await fetch(`${this.CURRENCIES_API_URL}?prettyprint=false&show_alternative=false&show_inactive=false&app_id=${this.APP_ID}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch currencies: ${response.status} ${response.statusText}`);
      }

      const currenciesData: CurrenciesResponse = await response.json();
      console.log('✅ CurrencyService: API response received:', Object.keys(currenciesData).length, 'currencies');
      
      // Transform data to our Currency interface
      const currencies: Currency[] = Object.entries(currenciesData).map(([code, name]) => ({
        code,
        name
      }));

      // Sort currencies alphabetically by name
      currencies.sort((a, b) => a.name.localeCompare(b.name));

      // Cache the result
      this.cacheCurrencies(currencies);

      return currencies;
    } catch (error) {
      console.error('❌ CurrencyService: Error fetching currencies:', error);
      
      // Return fallback currencies if API fails
      const fallbackCurrencies = this.getFallbackCurrencies();
      console.log('🔄 CurrencyService: Using fallback currencies:', fallbackCurrencies.length, 'currencies');
      return fallbackCurrencies;
    }
  }

  /**
   * Get cached currencies if available and not expired
   */
  private getCachedCurrencies(): Currency[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached currencies:', error);
      return null;
    }
  }

  /**
   * Cache currencies with timestamp
   */
  private cacheCurrencies(currencies: Currency[]): void {
    try {
      const cacheData = {
        data: currencies,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching currencies:', error);
    }
  }

  /**
   * Get fallback currencies for when API is unavailable
   */
  private getFallbackCurrencies(): Currency[] {
    return [
      { code: 'USD', name: 'United States Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound Sterling' },
      { code: 'SAR', name: 'Saudi Riyal' },
      { code: 'AED', name: 'United Arab Emirates Dirham' },
      { code: 'QAR', name: 'Qatari Rial' },
      { code: 'KWD', name: 'Kuwaiti Dinar' },
      { code: 'BHD', name: 'Bahraini Dinar' },
      { code: 'OMR', name: 'Omani Rial' },
      { code: 'JOD', name: 'Jordanian Dinar' },
      { code: 'LBP', name: 'Lebanese Pound' },
      { code: 'EGP', name: 'Egyptian Pound' },
      { code: 'INR', name: 'Indian Rupee' },
      { code: 'PKR', name: 'Pakistani Rupee' },
      { code: 'CNY', name: 'Chinese Yuan' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'AUD', name: 'Australian Dollar' },
      { code: 'CAD', name: 'Canadian Dollar' },
      { code: 'CHF', name: 'Swiss Franc' },
      { code: 'SEK', name: 'Swedish Krona' },
      { code: 'NOK', name: 'Norwegian Krone' },
      { code: 'DKK', name: 'Danish Krone' },
      { code: 'PLN', name: 'Polish Zloty' },
      { code: 'CZK', name: 'Czech Republic Koruna' },
      { code: 'HUF', name: 'Hungarian Forint' },
      { code: 'RUB', name: 'Russian Ruble' },
      { code: 'TRY', name: 'Turkish Lira' },
      { code: 'ZAR', name: 'South African Rand' },
      { code: 'BRL', name: 'Brazilian Real' },
      { code: 'MXN', name: 'Mexican Peso' },
      { code: 'ARS', name: 'Argentine Peso' },
      { code: 'CLP', name: 'Chilean Peso' },
      { code: 'COP', name: 'Colombian Peso' },
      { code: 'PEN', name: 'Peruvian Nuevo Sol' },
      { code: 'UYU', name: 'Uruguayan Peso' },
      { code: 'VES', name: 'Venezuelan Bolívar Soberano' },
      { code: 'KRW', name: 'South Korean Won' },
      { code: 'THB', name: 'Thai Baht' },
      { code: 'SGD', name: 'Singapore Dollar' },
      { code: 'MYR', name: 'Malaysian Ringgit' },
      { code: 'IDR', name: 'Indonesian Rupiah' },
      { code: 'PHP', name: 'Philippine Peso' },
      { code: 'VND', name: 'Vietnamese Dong' },
      { code: 'HKD', name: 'Hong Kong Dollar' },
      { code: 'TWD', name: 'New Taiwan Dollar' },
      { code: 'NZD', name: 'New Zealand Dollar' },
      { code: 'FJD', name: 'Fijian Dollar' },
      { code: 'XAU', name: 'Gold Ounce' },
      { code: 'XAG', name: 'Silver Ounce' }
    ];
  }

  /**
   * Get currency by code
   */
  public getCurrencyByCode(code: string, currencies: Currency[]): Currency | undefined {
    return currencies.find(currency => currency.code === code);
  }

  /**
   * Format currency display
   */
  public formatCurrencyDisplay(currency: Currency): string {
    return `${currency.code} - ${currency.name}`;
  }
}

export const currencyService = new CurrencyService();
