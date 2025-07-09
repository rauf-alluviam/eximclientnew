import { tokenService } from '../utils/TokenService';

/**
 * Global token validation manager
 * This ensures only one validation interval runs regardless of how many components use useAutoLogout
 */
class TokenValidationManager {
  constructor() {
    this.interval = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the global token validation interval
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    
    // Start validation interval
    this.interval = setInterval(() => {
      // Only validate if there are subscribers
      if (tokenService.subscribers.size > 0) {
        // Determine user type from localStorage
        const superAdminUser = localStorage.getItem('superadmin_user');
        const regularUser = localStorage.getItem('exim_user');
        
        if (superAdminUser) {
          tokenService.validateToken('superadmin');
        } else if (regularUser) {
          tokenService.validateToken('user');
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Cleanup the global interval
   */
  cleanup() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isInitialized = false;
  }
}

export const tokenValidationManager = new TokenValidationManager();
