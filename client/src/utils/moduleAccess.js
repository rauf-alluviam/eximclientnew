/**
 * Helper functions for module access control
 */

/**
 * Get user's assigned modules from localStorage
 * @returns {Array} Array of assigned module IDs
 */
export const getUserAssignedModules = () => {
  try {
    const userData = localStorage.getItem("exim_user");
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      // Handle both old and new user data structures
      // New structure: user data is stored directly
      if (parsedUser.assignedModules) {
        return parsedUser.assignedModules || [];
      }
      
      // Old structure: user data is nested under data.user
      const oldFormatModules = parsedUser?.data?.user?.assignedModules || [];
      return oldFormatModules;
    }
  } catch (error) {
    console.error("Error parsing user data for modules:", error);
  }
  
  return [];
};

/**
 * Check if user has access to a specific module
 * @param {string} moduleId - Module ID to check
 * @returns {boolean} True if user has access
 */
export const hasModuleAccess = (moduleId) => {
  const assignedModules = getUserAssignedModules();
  return assignedModules.includes(moduleId);
};

/**
 * Filter modules based on user's assigned modules
 * @param {Array} allModules - All available modules
 * @returns {Array} Filtered modules with access status
 */
export const filterModulesByAccess = (allModules) => {
  const assignedModules = getUserAssignedModules();
  
  return allModules.map(module => ({
    ...module,
    hasAccess: assignedModules.includes(module.path),
    isLocked: !assignedModules.includes(module.path)
  }));
};

/**
 * Get locked modules (modules user doesn't have access to)
 * @param {Array} allModules - All available modules
 * @returns {Array} Locked modules
 */
export const getLockedModules = (allModules) => {
  const assignedModules = getUserAssignedModules();
  
  return allModules.filter(module => !assignedModules.includes(module.path));
};

/**
 * Refresh user data from the server to get updated module assignments
 * @returns {Promise<boolean>} True if refresh was successful
 */
export const refreshUserData = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_STRING}/validate-session`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.user) {
        // Get current user data to check what format we're using
        const currentUserData = localStorage.getItem("exim_user");
        let isOldFormat = false;
        
        if (currentUserData) {
          const parsed = JSON.parse(currentUserData);
          isOldFormat = parsed.data && parsed.data.user;
        }
        
        // Update localStorage with fresh user data in the correct format
        if (isOldFormat) {
          // Old format: { data: { user: {...} } }
          const userData = {
            data: {
              user: {
                id: data.user.id,
                name: data.user.name,
                ie_code_no: data.user.ie_code_no,
                isActive: data.user.isActive,
                assignedModules: data.user.assignedModules || [],
                lastLogin: data.user.lastLogin,
              }
            }
          };
          localStorage.setItem("exim_user", JSON.stringify(userData));
        } else {
          // New format: direct user object
          const userData = {
            id: data.user.id,
            name: data.user.name,
            ie_code_no: data.user.ie_code_no,
            isActive: data.user.isActive,
            assignedModules: data.user.assignedModules || [],
            lastLogin: data.user.lastLogin,
          };
          localStorage.setItem("exim_user", JSON.stringify(userData));
        }
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return false;
  }
};

/**
 * Force refresh of user's module assignments (useful for real-time updates)
 * This can be called from anywhere in the app when module assignments change
 */
export const forceRefreshUserModules = async () => {
  const success = await refreshUserData();
  if (success) {
    // Trigger a custom event to notify components that user data has been refreshed
    window.dispatchEvent(new CustomEvent('userDataRefreshed'));
  }
  return success;
};

/**
 * Listen for user data refresh events
 * @param {Function} callback - Function to call when user data is refreshed
 * @returns {Function} Cleanup function to remove the event listener
 */
export const onUserDataRefresh = (callback) => {
  const handleRefresh = () => callback();
  window.addEventListener('userDataRefreshed', handleRefresh);
  
  // Return cleanup function
  return () => window.removeEventListener('userDataRefreshed', handleRefresh);
};
