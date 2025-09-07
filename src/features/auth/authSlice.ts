import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { getApiBaseUrl } from '../../config/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  type: 'admin' | 'employee';
  status: string;
  roleIds: string[];
  roles: Array<{
    _id: string;
    name: string;
    permissions: string[];
    description: string;
  }>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  isInitialized: boolean; // Track if auth state has been initialized
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: [],
  isInitialized: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const authState = authService.initializeAuthState();
      if (authState) {
        // Validate and refresh token if needed
        const validation = await authService.validateAndRefreshToken();
        
        if (validation.isValid) {
          // Return auth state with potentially updated token
          return {
            ...authState,
            accessToken: validation.newAccessToken || authState.accessToken
          };
        } else {
          console.log('Token validation failed, clearing auth state');
          return rejectWithValue('Token validation failed');
        }
      }
      return rejectWithValue('No valid session found');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { accessToken } = data.data;
      
      // Update stored token
      localStorage.setItem('accessToken', accessToken);
      
      return { accessToken };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string; permissions: string[] }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.permissions = action.payload.permissions;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.permissions = [];
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.permissions = action.payload.permissions;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload as string;
        // Don't clear auth state on refresh failure, let the interceptor handle it
      });
  },
});

export const { clearError, setCredentials, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
