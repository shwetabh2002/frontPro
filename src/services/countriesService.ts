// Types for country data
export interface Country {
  name: string;
  code: string;
  dial_code: string;
}

export interface CountriesResponse {
  error: boolean;
  msg: string;
  data: Country[];
}

// Countries Service
class CountriesService {
  private countries: Country[] = [];
  private isLoaded = false;

  /**
   * Fetch all countries from the API
   * @returns Promise with countries data
   */
  async getCountries(): Promise<Country[]> {
    if (this.isLoaded && this.countries.length > 0) {
      return this.countries;
    }

    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/codes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CountriesResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.msg);
      }

      // Sort countries by name for better UX
      this.countries = data.data.sort((a, b) => a.name.localeCompare(b.name));
      this.isLoaded = true;
      
      return this.countries;
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Return fallback countries if API fails
      return this.getFallbackCountries();
    }
  }

  /**
   * Get country by dial code
   * @param dialCode - Country dial code (e.g., "+1")
   * @returns Country object or undefined
   */
  getCountryByDialCode(dialCode: string): Country | undefined {
    return this.countries.find(country => country.dial_code === dialCode);
  }

  /**
   * Get popular countries for quick selection
   * @returns Array of popular countries
   */
  getPopularCountries(): Country[] {
    const popularCodes = ['+971', '+1', '+44', '+91', '+86', '+81', '+49', '+33', '+39', '+34', '+7'];
    return this.countries.filter(country => popularCodes.includes(country.dial_code));
  }

  /**
   * Fallback countries if API fails
   * @returns Array of fallback countries
   */
  private getFallbackCountries(): Country[] {
    return [
      { name: 'United Arab Emirates', code: 'AE', dial_code: '+971' },
      { name: 'United States', code: 'US', dial_code: '+1' },
      { name: 'United Kingdom', code: 'GB', dial_code: '+44' },
      { name: 'India', code: 'IN', dial_code: '+91' },
      { name: 'China', code: 'CN', dial_code: '+86' },
      { name: 'Japan', code: 'JP', dial_code: '+81' },
      { name: 'Germany', code: 'DE', dial_code: '+49' },
      { name: 'France', code: 'FR', dial_code: '+33' },
      { name: 'Italy', code: 'IT', dial_code: '+39' },
      { name: 'Spain', code: 'ES', dial_code: '+34' },
      { name: 'Russia', code: 'RU', dial_code: '+7' },
      { name: 'Canada', code: 'CA', dial_code: '+1' },
      { name: 'Australia', code: 'AU', dial_code: '+61' },
      { name: 'Brazil', code: 'BR', dial_code: '+55' },
      { name: 'Mexico', code: 'MX', dial_code: '+52' },
      { name: 'South Korea', code: 'KR', dial_code: '+82' },
      { name: 'Netherlands', code: 'NL', dial_code: '+31' },
      { name: 'Switzerland', code: 'CH', dial_code: '+41' },
      { name: 'Sweden', code: 'SE', dial_code: '+46' },
      { name: 'Norway', code: 'NO', dial_code: '+47' },
      { name: 'Denmark', code: 'DK', dial_code: '+45' },
    ];
  }

  /**
   * Get country flag emoji by country code
   * @param countryCode - ISO country code (e.g., "US")
   * @returns Flag emoji string
   */
  getCountryFlag(countryCode: string): string {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
}

// Export singleton instance
export const countriesService = new CountriesService();
