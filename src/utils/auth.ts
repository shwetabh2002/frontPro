import { User } from '../features/auth/authSlice';

export const hasRole = (user: User | null, role: 'admin' | 'employee'): boolean => {
  if (!user) return false;
  
  return user.type === role;
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin');
};

export const isEmployee = (user: User | null): boolean => {
  return hasRole(user, 'employee');
};
