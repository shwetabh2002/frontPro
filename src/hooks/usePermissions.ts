import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Role, hasPermission, getAccessiblePages, Permission } from '../config/rbac';

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const userRoles = useMemo((): Role[] => {
    if (!user?.roles || !Array.isArray(user.roles)) {
      return [];
    }
    // Extract role names from the roles array and filter for valid roles
    const validRoles = user.roles
      .map(role => role.name?.toUpperCase())
      .filter((roleName): roleName is Role => 
        roleName === 'ADMIN' || roleName === 'SALES' || roleName === 'FINANCE'
      );
    return validRoles;
  }, [user?.roles]);
  
  const isAdmin = useMemo(() => {
    return userRoles.includes('ADMIN');
  }, [userRoles]);
  
  const accessiblePages = useMemo(() => {
    return getAccessiblePages(userRoles);
  }, [userRoles]);
  
  const canAccessPage = (page: keyof Permission['pages']): boolean => {
    return hasPermission(userRoles, page);
  };
  
  const canAccessFeature = (
    feature: keyof Permission['features'],
    action: string
  ): boolean => {
    return hasPermission(userRoles, undefined, feature, action);
  };
  
  const canViewFeature = (feature: keyof Permission['features']): boolean => {
    return hasPermission(userRoles, undefined, feature, 'view');
  };
  
  const canAddFeature = (feature: keyof Permission['features']): boolean => {
    return hasPermission(userRoles, undefined, feature, 'add');
  };
  
  const canEditFeature = (feature: keyof Permission['features']): boolean => {
    return hasPermission(userRoles, undefined, feature, 'edit');
  };
  
  const canDeleteFeature = (feature: keyof Permission['features']): boolean => {
    return hasPermission(userRoles, undefined, feature, 'delete');
  };
  
  // Specific permission checks for common use cases
  const canApproveExpenses = (): boolean => {
    return hasPermission(userRoles, 'expenses', 'expenses', 'approve');
  };
  
  const canExportInvoices = (): boolean => {
    return hasPermission(userRoles, 'invoices', 'invoices', 'exportExcel');
  };
  
  const canViewCostPrice = (): boolean => {
    return hasPermission(userRoles, 'inventory', 'inventory', 'viewCostPrice');
  };
  
  const canManageInventory = (): boolean => {
    return hasPermission(userRoles, 'inventory', 'inventory', 'add') ||
           hasPermission(userRoles, 'inventory', 'inventory', 'edit');
  };
  
  const canDeleteCustomers = (): boolean => {
    return hasPermission(userRoles, 'customers', 'customers', 'delete');
  };
  
  const canEditApprovedExpenses = (): boolean => {
    return hasPermission(userRoles, 'expenses', 'expenses', 'editApproved');
  };
  
  const canDeleteApprovedExpenses = (): boolean => {
    return hasPermission(userRoles, 'expenses', 'expenses', 'deleteApproved');
  };
  
  return {
    userRoles,
    isAdmin,
    accessiblePages,
    canAccessPage,
    canAccessFeature,
    canViewFeature,
    canAddFeature,
    canEditFeature,
    canDeleteFeature,
    canApproveExpenses,
    canExportInvoices,
    canViewCostPrice,
    canManageInventory,
    canDeleteCustomers,
    canEditApprovedExpenses,
    canDeleteApprovedExpenses,
  };
};
