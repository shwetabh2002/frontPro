import { API_CONFIG, buildApiUrl } from '../config/api';
import { ERROR_MESSAGES } from '../constants';

// Types
export interface InventoryItem {
  _id: string;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  sku: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  inStock: boolean;
  condition: string;
  status: string;
}

export interface FilterSummary {
  category: string[];
  brand: string[];
  model: string[];
  year: number[];
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: {
    items: InventoryItem[];
    summary: FilterSummary;
    totalItems: number;
  };
}

export interface InventoryFilters {
  category: string;
  brand?: string;
  model?: string;
  year?: string | number;
}

// Inventory Service
class InventoryService {
  /**
   * Fetch inventory requirements based on filters
   * @param filters - Inventory filter criteria
   * @returns Promise with inventory data and summary
   */
  async getRequirementsCars(filters: InventoryFilters): Promise<InventoryResponse> {
    try {
      const params: Record<string, string | number> = {
        category: filters.category,
      };

      if (filters.brand) params.brand = filters.brand;
      if (filters.model) params.model = filters.model;
      if (filters.year) params.year = filters.year;

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTORY.REQUIREMENTS_CARS, params);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
          'Accept': API_CONFIG.HEADERS.ACCEPT,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching inventory requirements:', error);
      throw new Error(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
    }
  }

  /**
   * Fetch all inventory items without any filters using requirements-cars endpoint
   * @returns Promise with all inventory items
   */
  async getAllItems(): Promise<InventoryResponse> {
    try {
      // Use requirements-cars endpoint without any filters to get all items
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTORY.REQUIREMENTS_CARS);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
          'Accept': API_CONFIG.HEADERS.ACCEPT,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all inventory items:', error);
      throw new Error(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
    }
  }

  /**
   * Get all inventory categories
   * @returns Promise with available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTORY.CATEGORIES);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
          'Accept': API_CONFIG.HEADERS.ACCEPT,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
