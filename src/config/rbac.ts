// RBAC Configuration
export type Role = 'ADMIN' | 'SALES' | 'FINANCE';

export interface Permission {
  // Page-level permissions
  pages: {
    dashboard: boolean;
    inventory: boolean;
    customers: boolean;
    quotations: boolean;
    orders: boolean;
    invoices: boolean;
    receipts: boolean;
    expenses: boolean;
    employees: boolean;
    analytics: boolean;
    suppliers: boolean;
    invoiceRequests: boolean;
    reviewOrders: boolean;
    salesReport: boolean;
  };
  
  // Feature-level permissions
  features: {
    // Inventory features
    inventory: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      viewCostPrice: boolean;
    };
    
    // Customer features
    customers: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    
    // Invoice features
    invoices: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      exportExcel: boolean;
    };
    
    // Quotation features
    quotations: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    
    // Order features
    orders: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    
    // Receipt features
    receipts: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    
    // Expense features
    expenses: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      editApproved: boolean; // Can edit approved expenses
      deleteApproved: boolean; // Can delete approved expenses
    };
    
    // Employee features
    employees: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    
    // Analytics features
    analytics: {
      view: boolean;
      export: boolean;
    };
    
    // Invoice Requests features
    invoiceRequests: {
      view: boolean;
      approve: boolean;
      reject: boolean;
    };
    
    // Review Orders features
    reviewOrders: {
      view: boolean;
      approve: boolean;
      reject: boolean;
    };
  };
}

// Role-based permissions configuration
export const ROLE_PERMISSIONS: Record<Role, Permission> = {
  ADMIN: {
    pages: {
      dashboard: true,
      inventory: true,
      customers: true,
      quotations: true,
      orders: true,
      invoices: true,
      receipts: true,
      expenses: true,
      employees: true,
      analytics: true,
      suppliers: true,
      invoiceRequests: true,
      reviewOrders: true,
      salesReport: true, // Admin only
    },
    features: {
      inventory: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        viewCostPrice: true,
      },
      customers: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      invoices: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        exportExcel: true,
      },
      quotations: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      orders: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      receipts: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      expenses: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        approve: true,
        editApproved: true,
        deleteApproved: true,
      },
      employees: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      analytics: {
        view: true,
        export: true,
      },
      invoiceRequests: {
        view: true,
        approve: true,
        reject: true,
      },
      reviewOrders: {
        view: true,
        approve: true,
        reject: true,
      },
    },
  },
  
  SALES: {
    pages: {
      dashboard: false, // Hidden - only for admin
      inventory: true,
      customers: true,
      quotations: true,
      orders: true,
      invoices: true,
      receipts: false, // Hidden - only for admin
      expenses: false, // Hidden - removed for sales role
      employees: false, // Hidden
      analytics: false, // Hidden
      suppliers: false, // Hidden
      invoiceRequests: true, // Hidden
      reviewOrders: false, // Hidden
      salesReport: true, // Accessible to sales users
    },
    features: {
      inventory: {
        view: true,
        add: false, // Cannot add products
        edit: false, // Cannot edit products
        delete: false,
        viewCostPrice: false, // Cannot see cost price
      },
      customers: {
        view: true,
        add: true,
        edit: true,
        delete: false, // Cannot delete customers
      },
      invoices: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        exportExcel: false, // Hidden export to Excel button
      },
      quotations: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      orders: {
        view: true,
        add: true,
        edit: true,
        delete: true,
      },
      receipts: {
        view: false, // Hidden - only for admin
        add: false,
        edit: false,
        delete: false,
      },
      expenses: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        approve: false, // Cannot approve expenses
        editApproved: false, // Cannot edit approved expenses
        deleteApproved: false, // Cannot delete approved expenses
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      analytics: {
        view: false,
        export: false,
      },
      invoiceRequests: {
        view: true, // Can view invoice requests
        approve: false, // Cannot approve
        reject: false, // Cannot reject
      },
      reviewOrders: {
        view: false,
        approve: false,
        reject: false,
      },
    },
  },
  
  FINANCE: {
    pages: {
      dashboard: false, // Hidden - only for admin
      inventory: false,
      customers: true,
      quotations: false, // Hidden
      orders: false, // Hidden
      invoices: true,
      receipts: false, // Hidden - only for admin
      expenses: true,
      employees: false,
      analytics: true,
      suppliers: false, // Hidden
      invoiceRequests: true,
      reviewOrders: false, // Hidden
      salesReport: false, // Hidden - only for admin
    },
    features: {
      inventory: {
        view: false,
        add: false,
        edit: false,
        delete: false,
        viewCostPrice: false,
      },
      customers: {
        view: true,
        add: false, // Hidden - no create customer button
        edit: false, // Only detail view access
        delete: false,
      },
      invoices: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        exportExcel: false, // Hidden export to Excel button
      },
      quotations: {
        view: false, // Hidden page
        add: false, // Hidden - no create quotation button
        edit: false,
        delete: false,
      },
      orders: {
        view: false, // Hidden page
        add: false,
        edit: false,
        delete: false,
      },
      receipts: {
        view: false, // Hidden - only for admin
        add: false,
        edit: false,
        delete: false,
      },
      expenses: {
        view: true,
        add: true,
        edit: true,
        delete: true,
        approve: false, // Cannot approve expenses
        editApproved: false, // Cannot edit approved expenses
        deleteApproved: false, // Cannot delete approved expenses
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      analytics: {
        view: true,
        export: true,
      },
      invoiceRequests: {
        view: true,
        approve: true,
        reject: true,
      },
      reviewOrders: {
        view: false,
        approve: false,
        reject: false,
      },
    },
  },
};

// Helper function to check if user has permission
export const hasPermission = (
  userRoles: Role[],
  page?: keyof Permission['pages'],
  feature?: keyof Permission['features'],
  action?: string
): boolean => {
  // Admin has all permissions
  if (userRoles.includes('ADMIN')) {
    return true;
  }
  
  // Check if user has any of the required roles
  for (const role of userRoles) {
    const permissions = ROLE_PERMISSIONS[role];
    
    // Check page-level permission
    if (page && !permissions.pages[page]) {
      continue;
    }
    
    // Check feature-level permission
    if (feature && action) {
      const featurePermissions = permissions.features[feature];
      if (featurePermissions && featurePermissions[action as keyof typeof featurePermissions]) {
        return true;
      }
    } else if (feature) {
      // If no specific action, check if any action is allowed
      const featurePermissions = permissions.features[feature];
      if (featurePermissions) {
        return Object.values(featurePermissions).some(permission => permission);
      }
    } else if (page) {
      // Only page-level check
      return true;
    }
  }
  
  return false;
};

// Helper function to get user's accessible pages
export const getAccessiblePages = (userRoles: Role[]): (keyof Permission['pages'])[] => {
  const accessiblePages: (keyof Permission['pages'])[] = [];
  
  for (const role of userRoles) {
    const permissions = ROLE_PERMISSIONS[role];
    Object.entries(permissions.pages).forEach(([page, hasAccess]) => {
      if (hasAccess && !accessiblePages.includes(page as keyof Permission['pages'])) {
        accessiblePages.push(page as keyof Permission['pages']);
      }
    });
  }
  
  return accessiblePages;
};
