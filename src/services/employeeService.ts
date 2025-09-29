import { API_CONFIG } from '../config/api';
import { apiClientService } from '../services/apiClient';

// Types
export interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleType: 'FINANCE' | 'SALES';
  address: string;
  countryCode: string;
}

export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  type: 'employee' | 'admin';
  status: 'active' | 'inactive';
  address: string;
  roleIds: Array<{
    _id: string;
    name: string;
    permissions: string[];
    description?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  __v: number;
}

export interface EmployeesResponse {
  success: boolean;
  message: string;
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalEmployees: number;
    statuses: string[];
    roles: string[];
    dateRange: {
      min: string;
      max: string;
    };
  };
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  data: Employee;
}

export const employeeService = {
  /**
   * Create a new employee
   * @param employeeData - Employee data
   * @returns Promise<CreateEmployeeResponse>
   * @throws ApiError
   */
  async createEmployee(employeeData: CreateEmployeeData): Promise<CreateEmployeeResponse> {
    try {
      const response = await apiClientService.post<CreateEmployeeResponse>(
        API_CONFIG.ENDPOINTS.USERS.EMPLOYEE,
        employeeData
      );
      return response;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to create employee');
    }
  },

  /**
   * Get all employees with filters
   * @param filters - Optional filters for employees
   * @returns Promise<EmployeesResponse>
   * @throws ApiError
   */
  async getEmployees(filters?: EmployeeFilters): Promise<EmployeesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = queryParams.toString() 
        ? `${API_CONFIG.ENDPOINTS.USERS.EMPLOYEES}?${queryParams.toString()}`
        : API_CONFIG.ENDPOINTS.USERS.EMPLOYEES;
        
      const response = await apiClientService.get<EmployeesResponse>(url);
      return response;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employees');
    }
  },

  /**
   * Get employee by ID
   * @param employeeId - Employee ID
   * @returns Promise<Employee>
   * @throws ApiError
   */
  async getEmployeeById(employeeId: string): Promise<Employee> {
    try {
      const response = await apiClientService.get<{success: boolean; message: string; data: Employee}>(
        `${API_CONFIG.ENDPOINTS.USERS.EMPLOYEES}/${employeeId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employee');
    }
  },

  /**
   * Update employee
   * @param employeeId - Employee ID
   * @param employeeData - Updated employee data
   * @returns Promise<Employee>
   * @throws ApiError
   */
  async updateEmployee(employeeId: string, employeeData: Partial<CreateEmployeeData>): Promise<Employee> {
    try {
      const response = await apiClientService.put<Employee>(
        `${API_CONFIG.ENDPOINTS.USERS.EMPLOYEE}/${employeeId}`,
        employeeData
      );
      return response;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      throw new Error(error.response?.data?.message || 'Failed to update employee');
    }
  },

  /**
   * Delete employee
   * @param employeeId - Employee ID
   * @returns Promise<{success: boolean; message: string; data: any; activeQuotations?: any[]}>
   * @throws ApiError
   */
  async deleteEmployee(employeeId: string): Promise<{success: boolean; message: string; data: any; activeQuotations?: any[]}> {
    try {
      const response = await apiClientService.delete<{success: boolean; message: string; data: any}>(
        `${API_CONFIG.ENDPOINTS.USERS.EMPLOYEES}/${employeeId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      
      // Handle 400 status code (business logic error - active quotations)
      if (error.response?.status === 400 && error.response?.data?.success === false) {
        return {
          success: false,
          message: error.response.data.message,
          data: error.response.data.data,
          activeQuotations: error.response.data.data?.activeQuotations || []
        };
      }
      
      throw new Error(error.response?.data?.message || 'Failed to delete employee');
    }
  },
};
