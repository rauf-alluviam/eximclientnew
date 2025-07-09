# Module Assignment Testing Guide

This guide provides comprehensive testing procedures for the module assignment system, covering both backend and frontend functionality.

## Overview

The module assignment system allows SuperAdmins to assign specific modules to customers, with real-time synchronization between the backend and frontend. This testing guide ensures the system works correctly and handles edge cases properly.

## Test Files

### Backend Test
- **File**: `d:\eximclient\server\test-module-assignment.js`
- **Purpose**: Tests all backend APIs and database operations
- **Features**: 
  - Database connectivity
  - SuperAdmin authentication
  - Module CRUD operations
  - Real-time sync verification
  - Error handling
  - Performance testing

### Frontend Test
- **File**: `d:\eximclient\client\src\utils\moduleAssignmentTester.js`
- **Purpose**: Tests frontend module access and display
- **Features**:
  - localStorage validation
  - Module access utilities
  - API integration
  - Real-time updates
  - Error handling
  - Debug tools

## Backend Testing

### Prerequisites
1. MongoDB connection established
2. SuperAdmin credentials available
3. Test customer exists in database
4. Server running on localhost:5000 (or configured port)

### Running Backend Tests

```bash
# Navigate to server directory
cd server

# Set environment variables (if needed)
export MONGODB_URI="your_mongodb_connection_string"
export SUPERADMIN_EMAIL="superadmin@example.com"
export SUPERADMIN_PASSWORD="superadmin123"

# Run the test
node test-module-assignment.js
```

### Backend Test Cases

#### 1. Database Connection Test
- **Purpose**: Verify MongoDB connectivity
- **Expected**: Successful connection message
- **Failure**: Check connection string and network

#### 2. SuperAdmin Authentication Test
- **Purpose**: Verify SuperAdmin login functionality
- **Expected**: Valid JWT token received
- **Failure**: Check credentials or authentication endpoint

#### 3. Available Modules Test
- **Purpose**: Retrieve list of available modules
- **Expected**: Array of module objects with id, name, description
- **Failure**: Check moduleController.js implementation

#### 4. Customer Module Assignment Test
- **Purpose**: Get current customer module assignments
- **Expected**: Customer object with assignedModules array
- **Failure**: Check customer exists and has proper schema

#### 5. Update Module Assignment Test
- **Purpose**: Update customer's assigned modules
- **Expected**: Successful update with new module list
- **Failure**: Check validation and database write permissions

#### 6. Bulk Assignment Test
- **Purpose**: Assign modules to multiple customers
- **Expected**: Successful bulk update with count
- **Failure**: Check bulk operation permissions

#### 7. Real-time Sync Test
- **Purpose**: Verify changes are immediately reflected
- **Expected**: Customer sees updated modules instantly
- **Failure**: Check token validation and user data refresh

#### 8. Error Handling Test
- **Purpose**: Test invalid inputs and edge cases
- **Expected**: Appropriate error messages and status codes
- **Failure**: Review error handling middleware

#### 9. Performance Test
- **Purpose**: Test system under load
- **Expected**: Reasonable response times for multiple requests
- **Failure**: Check database indexing and query optimization

## Frontend Testing

### Prerequisites
1. React application running
2. User logged in with valid session
3. Module access utilities loaded
4. ModuleDebugger available (development mode)

### Running Frontend Tests

#### Method 1: Browser Console
```javascript
// Open browser console and run:
window.testModuleAssignment();
```

#### Method 2: Import as Module
```javascript
import { ModuleAssignmentFrontendTester } from './utils/moduleAssignmentTester';

const tester = new ModuleAssignmentFrontendTester();
tester.runAllTests().then(results => {
  console.log('Test Results:', results);
});
```

### Frontend Test Cases

#### 1. localStorage User Data Test
- **Purpose**: Verify user data stored correctly
- **Expected**: Valid JSON with assignedModules field
- **Failure**: Check login process and data storage

#### 2. Module Access Utilities Test
- **Purpose**: Test utility functions for module access
- **Expected**: getUserAssignedModules returns correct modules
- **Failure**: Check moduleAccess.js implementation

#### 3. User Profile API Test
- **Purpose**: Verify API returns current user data
- **Expected**: Profile data with updated assignedModules
- **Failure**: Check API endpoint and authentication

#### 4. Navigation Access Test
- **Purpose**: Test UI navigation based on assigned modules
- **Expected**: Module links present for assigned modules
- **Failure**: Check navigation component implementation

#### 5. Real-time Updates Test
- **Purpose**: Verify updates without page refresh
- **Expected**: localStorage and UI updated automatically
- **Failure**: Check event listeners and refresh mechanisms

#### 6. Error Handling Test
- **Purpose**: Test graceful error handling
- **Expected**: No crashes with invalid data
- **Failure**: Add proper error boundaries

#### 7. Module Debugging Test
- **Purpose**: Test debugging tools functionality
- **Expected**: Debug tools provide useful information
- **Failure**: Check ModuleDebugger implementation

## Integration Testing

### End-to-End Test Flow

1. **SuperAdmin assigns modules to customer**
   ```javascript
   // SuperAdmin dashboard
   updateCustomerModuleAssignments(customerId, ['/importdsr', '/netpage']);
   ```

2. **Customer should see changes immediately**
   ```javascript
   // Customer frontend
   const modules = getUserAssignedModules(); // Should include new modules
   ```

3. **Verify persistence**
   ```javascript
   // After page refresh
   const modules = getUserAssignedModules(); // Should still include new modules
   ```

### Testing Scenarios

#### Scenario 1: New Customer Module Assignment
1. SuperAdmin assigns modules to new customer
2. Customer logs in
3. Verify customer sees assigned modules
4. Verify customer cannot access unassigned modules

#### Scenario 2: Module Update for Existing Customer
1. Customer has existing modules
2. SuperAdmin updates module assignments
3. Customer continues using application
4. Verify customer sees updated modules without logout/login

#### Scenario 3: Module Removal
1. Customer has multiple modules
2. SuperAdmin removes some modules
3. Verify customer loses access to removed modules
4. Verify customer retains access to remaining modules

#### Scenario 4: Bulk Operations
1. SuperAdmin performs bulk assignment
2. Multiple customers affected
3. Verify all customers see changes
4. Verify no unauthorized access

## Troubleshooting

### Common Issues

#### Backend Issues

**Test Failure: Database Connection**
- Check MongoDB connection string
- Verify network connectivity
- Ensure MongoDB service is running

**Test Failure: Authentication**
- Verify SuperAdmin credentials
- Check JWT secret configuration
- Ensure authentication middleware is working

**Test Failure: Module Updates**
- Check customer exists in database
- Verify assignedModules field in schema
- Ensure proper validation

#### Frontend Issues

**Test Failure: localStorage**
- Check if user is logged in
- Verify login process stores user data
- Ensure data format is correct

**Test Failure: Module Access**
- Check if moduleAccess.js is loaded
- Verify utility functions are available
- Ensure proper imports

**Test Failure: Real-time Updates**
- Check event listeners are set up
- Verify forceRefreshUserModules is called
- Ensure UI components are reactive

### Debug Commands

#### Backend Debug
```bash
# Enable debug logging
DEBUG=true node test-module-assignment.js

# Check database directly
node -e "
const mongoose = require('mongoose');
mongoose.connect('your_connection_string');
const Customer = require('./models/customerModel.js');
Customer.findOne({ie_code_no: '812023773'}).then(console.log);
"
```

#### Frontend Debug
```javascript
// Check user data
console.log('User data:', localStorage.getItem('userData'));

// Check module access
console.log('Assigned modules:', getUserAssignedModules());

// Force refresh
forceRefreshUserModules();

// Check debug info
if (window.ModuleDebugger) {
  const debugger = new window.ModuleDebugger();
  debugger.showDebugInfo();
}
```

## Performance Considerations

### Backend Performance
- Database queries are optimized with proper indexing
- Bulk operations use MongoDB's updateMany
- Response times should be under 500ms for single operations

### Frontend Performance
- localStorage operations are synchronous and fast
- Module access checks are O(1) operations
- Real-time updates use efficient event system

## Security Testing

### Backend Security
- All endpoints require proper authentication
- Module IDs are validated against available modules
- Customer data is properly sanitized

### Frontend Security
- No sensitive data in localStorage
- Module access is verified server-side
- XSS protection in place

## Automated Testing

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: Module Assignment Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd server && npm install
          cd ../client && npm install
      - name: Run backend tests
        run: cd server && node test-module-assignment.js
      - name: Run frontend tests
        run: cd client && npm test -- --testPathPattern=moduleAssignmentTester
```

### Monitoring
- Set up application monitoring for module assignment operations
- Track response times and error rates
- Monitor database performance for module queries

## Conclusion

This comprehensive testing suite ensures the module assignment system works correctly across all scenarios. Regular testing helps maintain system reliability and catch issues before they reach production.

For questions or issues, refer to the main documentation or contact the development team.
