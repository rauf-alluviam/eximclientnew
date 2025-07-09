// Test script to verify module assignment sync after fix
// Run this in the terminal to test the API endpoints

const axios = require('axios');

const testModuleSync = async () => {
  console.log('🔍 Testing Module Assignment Sync...\n');
  
  try {
    // Test the validate-session endpoint
    const response = await axios.get('http://localhost:5000/api/validate-session', {
      headers: {
        'Cookie': 'access_token=YOUR_ACCESS_TOKEN_HERE', // Replace with actual token
      },
      withCredentials: true
    });
    
    console.log('✅ Session validation response:');
    console.log('📊 User data:', response.data.user);
    console.log('📋 Assigned modules:', response.data.user.assignedModules);
    
    // Check specific modules
    const expectedModules = ['/importdsr', '/netpage'];
    const actualModules = response.data.user.assignedModules || [];
    
    console.log('\n🔍 Module Access Check:');
    expectedModules.forEach(module => {
      const hasAccess = actualModules.includes(module);
      console.log(`   ${module}: ${hasAccess ? '✅ ACCESSIBLE' : '❌ NOT ACCESSIBLE'}`);
    });
    
    if (JSON.stringify(actualModules.sort()) === JSON.stringify(expectedModules.sort())) {
      console.log('\n✅ SUCCESS: Module assignments are correctly synchronized!');
    } else {
      console.log('\n❌ ISSUE: Module assignments do not match expected values');
      console.log('   Expected:', expectedModules);
      console.log('   Actual:', actualModules);
    }
    
  } catch (error) {
    console.error('❌ Error testing module sync:', error.response?.data || error.message);
  }
};

// Alternative test using direct MongoDB query
const testDatabaseSync = async () => {
  console.log('\n🔍 Testing Database Sync...\n');
  
  // This would be run in MongoDB shell or Node.js environment
  const dbQuery = `
    db.customers.findOne(
      { ie_code_no: "ABDFM8378H" },
      { name: 1, ie_code_no: 1, assignedModules: 1 }
    );
  `;
  
  console.log('📋 MongoDB Query to run:');
  console.log(dbQuery);
  
  console.log('\n📊 Expected Result:');
  console.log(`{
    "_id": ObjectId("..."),
    "name": "MARUTI RECYCLING",
    "ie_code_no": "ABDFM8378H",
    "assignedModules": ["/importdsr", "/netpage"]
  }`);
};

// Instructions for manual testing
console.log('🧪 Module Assignment Sync Test Instructions:');
console.log('=====================================\n');

console.log('1. First, restart your Node.js server to apply the middleware fix');
console.log('2. Log in as the customer (MARUTI RECYCLING) in the browser');
console.log('3. Open browser console and run the following:');
console.log('');
console.log('   // Check localStorage');
console.log('   const user = JSON.parse(localStorage.getItem("exim_user"));');
console.log('   console.log("Assigned modules:", user.data?.user?.assignedModules);');
console.log('');
console.log('   // Test API directly');
console.log('   fetch("/api/validate-session", {');
console.log('     method: "GET",');
console.log('     credentials: "include"');
console.log('   })');
console.log('   .then(r => r.json())');
console.log('   .then(d => console.log("API modules:", d.user?.assignedModules));');
console.log('');
console.log('4. Expected result: assignedModules should contain ["/importdsr", "/netpage"]');
console.log('');
console.log('5. If modules are still empty, check server logs for any authentication errors');

// Run the database test
testDatabaseSync();
