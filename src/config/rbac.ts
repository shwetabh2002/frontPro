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
      receipts: true,
      expenses: true,
      employees: false, // Hidden
      analytics: false, // Hidden
      suppliers: false, // Hidden
      invoiceRequests: false, // Hidden
      reviewOrders: false, // Hidden
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
        approve: false, // Cannot approve expenses
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
    },
  },
  
  FINANCE: {
    pages: {
      dashboard: false, // Hidden - only for admin
      inventory: false,
      customers: true,
      quotations: true,
      orders: true,
      invoices: true,
      receipts: true,
      expenses: true,
      employees: false,
      analytics: true,
      suppliers: true,
      invoiceRequests: true,
      reviewOrders: true,
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
        add: false, // Only detail view access
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
        approve: false, // Cannot approve expenses
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
