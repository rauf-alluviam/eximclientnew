// Test Module Access Synchronization
// Run this in browser console on the customer homepage

// 1. Check current user's assigned modules
const userData = localStorage.getItem("exim_user");
const parsedUser = JSON.parse(userData);
const assignedModules = parsedUser.assignedModules || parsedUser.data?.user?.assignedModules || [];
console.log("🔍 Current assigned modules:", assignedModules);

// 2. Check if specific modules are accessible
const testModules = [
  "/importdsr",
  "/netpage", 
  "http://snapcheckv1.s3-website.ap-south-1.amazonaws.com/",
  "http://qrlocker.s3-website.ap-south-1.amazonaws.com/",
  "http://task-flow-ai.s3-website.ap-south-1.amazonaws.com/",
  "#"
];

testModules.forEach(moduleId => {
  const hasAccess = assignedModules.includes(moduleId);
  console.log(`📋 Module ${moduleId}: ${hasAccess ? '✅ ACCESSIBLE' : '❌ LOCKED'}`);
});

// 3. Test API call to validate session
fetch('/api/validate-session', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(data => {
  console.log("🌐 Server response modules:", data.user?.assignedModules);
  console.log("🔄 Sync status:", 
    JSON.stringify(assignedModules.sort()) === JSON.stringify(data.user?.assignedModules?.sort()) 
    ? "✅ SYNCHRONIZED" : "❌ OUT OF SYNC"
  );
});
