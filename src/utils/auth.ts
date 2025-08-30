import { User } from '../features/auth/authSlice';

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  return user.roles.some(role => 
    role.permissions.includes(permission)
  );
};

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

export const canAccessRoute = (user: User | null, requiredPermissions: string[]): boolean => {
  if (!user) return false;
  
  if (isAdmin(user)) return true; // Admin has access to everything
  
  return requiredPermissions.some(permission => 
    hasPermission(user, permission)
  );
};
