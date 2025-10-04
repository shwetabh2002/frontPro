import { API_CONFIG } from '../config/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';
import { apiClientService } from './apiClient';

export interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  subcategory: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdBy: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
    id: string;
  };
  attachments: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalAmount: number;
  id: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalExpenses: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  byStatus: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  byCategory: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export interface ExpensePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
    pagination: ExpensePagination;
    summary: ExpenseSummary;
  };
}

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const expenseService = {
  /**
   * Get expenses with pagination and filters
   * @param params - Query parameters for pagination and filters
   * @returns Promise<ExpensesResponse>
   * @throws ApiError
   */
  async getExpenses(params: GetExpensesParams = {}): Promise<ExpensesResponse> {
    try {
      // Build query parameters
      const queryParams: Record<string, string | number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.status) queryParams.status = params.status;
      if (params.category) queryParams.category = params.category;
      if (params.paymentMethod) queryParams.paymentMethod = params.paymentMethod;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.search) queryParams.search = params.search;

      const response = await apiClientService.get<ExpensesResponse>(
        API_CONFIG.ENDPOINTS.EXPENSES.GET_ALL,
        { params: queryParams }
      );

      return response;
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.EXPENSE.FETCH_FAILED);
    }
  },

  /**
   * Get expense by ID
   * @param id - Expense ID
   * @returns Promise<Expense>
   * @throws ApiError
   */
  async getExpenseById(id: string): Promise<Expense> {
    try {
      const response = await apiClientService.get<{ success: boolean; data: Expense }>(
        `${API_CONFIG.ENDPOINTS.EXPENSES.GET_BY_ID}/${id}`
      );

      if (!response.success || !response.data) {
        throw new Error('Expense not found');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching expense:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch expense');
    }
  },

  /**
   * Create a new expense
   * @param data - Expense data to create
   * @returns Promise<Expense>
   * @throws ApiError
   */
  async createExpense(data: CreateExpenseData): Promise<Expense> {
    try {
      const response = await apiClientService.post<{ success: boolean; data: Expense }>(
        API_CONFIG.ENDPOINTS.EXPENSES.CREATE,
        data
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to create expense');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error creating expense:', error);
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.EXPENSE.CREATE_FAILED);
    }
  },

  /**
   * Update expense
   * @param id - Expense ID
   * @param data - Updated expense data
   * @returns Promise<Expense>
   * @throws ApiError
   */
  async updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
    try {
      const response = await apiClientService.put<{ success: boolean; message: string; data: Expense }>(
        `${API_CONFIG.ENDPOINTS.EXPENSES.UPDATE}/${id}`,
        data
      );

      if (!response.success || !response.data) {
        throw new Error('Failed to update expense');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating expense:', error);
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.EXPENSE.UPDATE_FAILED);
    }
  },

  /**
   * Delete expense
   * @param id - Expense ID
   * @returns Promise<{ success: boolean; message: string; data: { expenseId: string } }>
   * @throws ApiError
   */
  async deleteExpense(id: string): Promise<{ success: boolean; message: string; data: { expenseId: string } }> {
    try {
      const response = await apiClientService.delete<{ success: boolean; message: string; data: { expenseId: string } }>(
        `${API_CONFIG.ENDPOINTS.EXPENSES.DELETE}/${id}`
      );

      if (!response.success) {
        throw new Error('Failed to delete expense');
      }

      return response;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.EXPENSE.DELETE_FAILED);
    }
  }
};

export interface CreateExpenseData {
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  paymentMethod: string;
  status?: 'pending' | 'approved' | 'rejected' | 'paid';
  attachments?: any[];
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  id?: string;
}
