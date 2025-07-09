import { useState, useCallback } from 'react';
import axios from 'axios';
import { validateSuperAdminToken } from '../utils/tokenValidation';

export const useSuperAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get SuperAdmin headers
  const getSuperAdminHeaders = useCallback(() => {
    const validation = validateSuperAdminToken();
    
    if (!validation.isValid) {
      throw new Error('SuperAdmin authentication failed');
    }
    
    return {
      headers: {
        Authorization: `Bearer ${validation.token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };
  }, []);

  // Generic API call function
  const apiCall = useCallback(async (endpoint, method = 'GET', data = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        method,
        url: `${process.env.REACT_APP_API_STRING}${endpoint}`,
        ...getSuperAdminHeaders(),
      };

      if (data && method !== 'GET') {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSuperAdminHeaders]);

  // Specific API methods
  const getDashboardAnalytics = useCallback(() => 
    apiCall('/dashboard/analytics'), [apiCall]
  );

  const getUserActivity = useCallback((type = 'active', limit = 5) => 
    apiCall(`/dashboard/user-activity?type=${type}&limit=${limit}`), [apiCall]
  );

  const getCustomers = useCallback(() => 
    apiCall('/registered-customers'), [apiCall]
  );

  const updateCustomerPassword = useCallback((customerId, newPassword) => 
    apiCall(`/customer/${customerId}/password`, 'PUT', { newPassword }), [apiCall]
  );

  const getKycRecords = useCallback(() => 
    apiCall('/customer-kyc-list'), [apiCall]
  );

  const registerCustomer = useCallback((customerData) => 
    apiCall('/register', 'POST', customerData), [apiCall]
  );

  const getInactiveCustomers = useCallback(() => 
    apiCall('/inactive-customers'), [apiCall]
  );

  // Module management methods
  const getAvailableModules = useCallback(() => 
    apiCall('/modules/available'), [apiCall]
  );

  const getCustomerModuleAssignments = useCallback((customerId) => 
    apiCall(`/modules/customer/${customerId}`), [apiCall]
  );

  const updateCustomerModuleAssignments = useCallback((customerId, moduleIds) => 
    apiCall(`/modules/customer/${customerId}`, 'PUT', { assignedModules: moduleIds }), [apiCall]
  );

  const getAllCustomersWithModules = useCallback(() => 
    apiCall('/modules/customers'), [apiCall]
  );

  const bulkAssignModules = useCallback((assignments) => 
    apiCall('/modules/bulk-assign', 'POST', assignments), [apiCall]
  );

  return {
    loading,
    error,
    setError,
    // API methods
    getDashboardAnalytics,
    getUserActivity,
    getCustomers,
    updateCustomerPassword,
    getKycRecords,
    registerCustomer,
    getInactiveCustomers,
    // Module management methods
    getAvailableModules,
    getCustomerModuleAssignments,
    updateCustomerModuleAssignments,
    getAllCustomersWithModules,
    bulkAssignModules,
    // Generic method for custom calls
    apiCall,
  };
};
