import { API_CONFIG, buildApiUrl, getApiBaseUrl } from '../config/api';
import { ERROR_MESSAGES } from '../constants';
import { apiClientService } from './apiClient';

// Types
export interface VinNumber {
  status: string;
  chasisNumber: string;
  _id: string;
  id: string;
  quotation?: {
    quotationId: string;
    quotationNumber: string;
    status: string;
    createdAt: string;
    customerName: string;
    createdBy?: {
      _id: string;
      name: string;
      email?: string;
    };
  };
}

export interface InventoryImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  _id: string;
  id: string;
}

export interface InventoryDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface InventoryUser {
  _id: string;
  name: string;
  email: string;
  id: string;
}

export interface InventorySupplier {
  _id: string;
  name: string;
  email: string;
  custId: string;
}

export interface CreateInventoryItemData {
  name: string;
  type: 'car' | 'part';
  category: string;
  subcategory?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  interiorColor?: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  inStock: boolean;
  condition: 'new' | 'used' | 'refurbished';
  status: 'active' | 'inactive'| 'out_of_stock';
  vinNumber: Array<{
    status: 'active' | 'hold';
    chasisNumber: string;
  }>;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  supplierId?: string;
}

export interface DetailedInventoryItem extends InventoryItem {
  dimensions: InventoryDimensions;
  images: InventoryImage[];
  createdBy: InventoryUser;
  updatedBy: InventoryUser;
  compatibility: any[];
  __v: number;
  createdAt: string;
  updatedAt: string;
  profitMargin: string;
  stockStatus: string;
  totalValue: number;
  id: string;
}

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
  newSellingPrice?: number;
  currencyType?: string;
  quantity: number;
  inStock: boolean;
  minStockLevel: number;
  condition: string;
  status: string;
  color: string;
  interiorColor?: string;
  vinNumber?: VinNumber[];
  tags?: string[];
  createdBy?: InventoryUser;
  updatedBy?: InventoryUser;
  supplierId?: InventorySupplier;
}

export interface FilterSummary {
  category: string[];
  brand: string[];
  model: string[];
  year: number[];
  color: string[];
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: {
    items: InventoryItem[];
    summary: FilterSummary;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    currencyInfo?: {
      currency: string;
      exchangeRate: number;
      baseCurrency: string;
    };
  };
}

// Separate interface for /inventory API endpoint
export interface AdvancedInventoryResponse {
  success: boolean;
  message: string;
  data: {
    items: InventoryItem[];
    summary: {
      types: string[];
      categories: string[];
      subcategories: string[];
      brands: string[];
      models: string[];
      years: number[];
      colors: string[];
      interiorColors: string[];
      conditions: string[];
      statuses: string[];
      warehouses: string[];
      allTags: string[];
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      applied: Record<string, any>;
      available: {
        types: string[];
        categories: string[];
        subcategories: string[];
        brands: string[];
        models: string[];
        years: number[];
        colors: string[];
        interiorColors: string[];
        conditions: string[];
        statuses: string[];
        warehouses: string[];
        allTags: string[];
      };
    };
    currencyInfo?: {
      currency: string;
      exchangeRate: number;
      baseCurrency: string;
    };
  };
}

export interface InventoryFilters {
  category: string;
  brand?: string;
  model?: string;
  year?: string | number;
  color?: string;
  currencyType?: string;
  page?: number;
  limit?: number;
}

export interface AdvancedInventoryFilters {
  type?: string;
  category?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  interiorColor?: string;
  condition?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  search?: string;
  page?: number;
  limit?: number;
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
      console.log('🔍 Received filters:', filters);
      
      const params: Record<string, string | number> = {
        category: filters.category,
      };

      if (filters.brand) params.brand = filters.brand;
      if (filters.model) params.model = filters.model;
      if (filters.year) params.year = filters.year;
      if (filters.color && filters.color.trim() !== '') {
        console.log('🎨 Adding color to params:', filters.color);
        params.color = filters.color;
      } else {
        console.log('🎨 No color or empty color, skipping:', filters.color);
      }
      if (filters.currencyType) {
        console.log('💰 Adding currencyType to params:', filters.currencyType);
        params.currencyType = filters.currencyType;
      }
      if (filters.page) {
        console.log('📄 Adding page to params:', filters.page);
        params.page = filters.page;
      }
      if (filters.limit) {
        console.log('📊 Adding limit to params:', filters.limit);
        params.limit = filters.limit;
      }

      console.log('🔍 Final params object:', params);
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTORY.REQUIREMENTS_CARS, params);
      
      console.log('🔍 Inventory API URL:', url);
      console.log('🔍 API Parameters:', params);
      
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
   * @param currencyType - Optional currency type for pricing
   * @param page - Page number for pagination (default: 1)
   * @param limit - Items per page (default: 20)
   * @returns Promise with paginated inventory items
   */
  async getAllItems(currencyType?: string, page: number = 1, limit: number = 20): Promise<InventoryResponse> {
    try {
      // Use requirements-cars endpoint without any filters to get all items
      const params: Record<string, string | number> = {
        page,
        limit
      };
      if (currencyType) {
        params.currencyType = currencyType;
      }
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
      console.error('Error fetching all inventory items:', error);
      throw new Error(ERROR_MESSAGES.INVENTORY.FETCH_FAILED);
    }
  }

  /**
   * Fetch inventory items with advanced filtering
   * @param filters - Advanced inventory filter criteria
   * @returns Promise with inventory data and summary
   */
  // Update existing inventory item
  async updateInventoryItem(itemId: string, itemData: Partial<CreateInventoryItemData>): Promise<{ success: boolean; message: string; data: DetailedInventoryItem }> {
    try {
      console.log('🔍 Updating inventory item:', itemId, itemData);
      const url = `${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.INVENTORY.INVENTORY}/${itemId}`;
      console.log('🔍 Update inventory API URL:', url);
      // Use API client with automatic token refresh
      const data = await apiClientService.put<{ success: boolean; message: string; data: DetailedInventoryItem }>(url, itemData);
      // Handle null createdBy and updatedBy in API response
      if (data.data) {
        data.data.createdBy = data.data.createdBy || { _id: '', name: '', email: '', id: '' };
        data.data.updatedBy = data.data.updatedBy || { _id: '', name: '', email: '', id: '' };
      }
      console.log('✅ Inventory item updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating inventory item:', error);
      throw error;
    }
  }

  // Create new inventory item
  async createInventoryItem(itemData: CreateInventoryItemData): Promise<{ success: boolean; message: string; data: DetailedInventoryItem }> {
    try {
      console.log('🔍 Creating inventory item:', itemData);
      
      const url = `${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.INVENTORY.INVENTORY}`;
      console.log('🔍 Create inventory API URL:', url);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: contentType,
          url: url
        });
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          const responseText = await response.text().catch(() => 'Unable to read response');
          console.error('❌ Non-JSON Response:', responseText.substring(0, 200));
          throw new Error(`HTTP error! status: ${response.status} - Server returned non-JSON response. Check console for details.`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text().catch(() => 'Unable to read response');
        console.error('❌ Non-JSON Response:', responseText.substring(0, 200));
        throw new Error('Server returned non-JSON response. Check console for details.');
      }

      const data = await response.json();
      
      // Handle null createdBy and updatedBy in API response
      if (data.data) {
        data.data.createdBy = data.data.createdBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        };
        data.data.updatedBy = data.data.updatedBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        };
      }
      
      console.log('✅ Inventory item created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating inventory item:', error);
      throw error;
    }
  }

  // Get individual inventory item by ID
  async getInventoryItemById(itemId: string): Promise<{ success: boolean; message: string; data: DetailedInventoryItem }> {
    try {
      console.log('🔍 Fetching inventory item by ID:', itemId);
      
      const url = `${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.INVENTORY.GET_BY_ID}/${itemId}`;
      console.log('🔍 Inventory item API URL:', url);
      
      // Use API client with automatic token refresh
      const data = await apiClientService.get<{ success: boolean; message: string; data: DetailedInventoryItem }>(url);
      
      // Handle null createdBy and updatedBy in API response
      if (data.data) {
        data.data.createdBy = data.data.createdBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        };
        data.data.updatedBy = data.data.updatedBy || {
          _id: '',
          name: '',
          email: '',
          id: ''
        };
      }
      
      console.log('✅ Inventory item loaded successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching inventory item:', error);
      throw error;
    }
  }

  async getInventoryItems(filters: AdvancedInventoryFilters = {}): Promise<AdvancedInventoryResponse> {
    try {
      console.log('🔍 Fetching inventory with filters:', filters);
      
      const params: Record<string, string | number> = {};
      
      // Add all filter parameters
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.model) params.model = filters.model;
      if (filters.year) params.year = filters.year;
      if (filters.color) params.color = filters.color;
      if (filters.interiorColor) params.interiorColor = filters.interiorColor;
      if (filters.condition) params.condition = filters.condition;
      if (filters.status) params.status = filters.status;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minQuantity) params.minQuantity = filters.minQuantity;
      if (filters.maxQuantity) params.maxQuantity = filters.maxQuantity;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      console.log('🔍 Final params object:', params);
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTORY.INVENTORY, params);
      
      console.log('🔍 Inventory API URL:', url);
      
      // Use API client with automatic token refresh
      const data = await apiClientService.get<AdvancedInventoryResponse>(url);
      console.log('✅ Inventory data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
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

  /**
   * Bulk upload inventory items from XLSX file
   * @param file - The XLSX file to upload
   * @returns Promise with upload result
   */
  async bulkUploadInventory(file: File): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🔍 Uploading inventory file:', file.name);
      
      const url = `${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.INVENTORY.BULK_UPLOAD}`;
      console.log('🔍 Bulk upload API URL:', url);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          const responseText = await response.text().catch(() => 'Unable to read response');
          throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('✅ Non-JSON Response:', responseText);
        return {
          success: true,
          message: 'File uploaded successfully',
          data: responseText
        };
      }

      const data = await response.json();
      console.log('✅ Bulk upload successful:', data);
      return {
        success: true,
        message: data.message || 'File uploaded successfully',
        data: data.data
      };
    } catch (error) {
      console.error('❌ Error uploading inventory file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload inventory file';
      throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
