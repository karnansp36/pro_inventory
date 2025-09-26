import axios from 'axios';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

// Test users from seed data
const TEST_USERS = {
  admin: { email: 'admin@example.com', password: 'password123', role: 'Admin' },
  brandOwner: { email: 'brandowner@example.com', password: 'password123', role: 'BrandOwner' },
  manager: { email: 'manager@example.com', password: 'password123', role: 'Manager' },
  branchOwner: { email: 'branchowner@example.com', password: 'password123', role: 'BranchOwner' }
};

let tokens = {};

// Enhanced API request with detailed logging
const apiRequest = async (method, endpoint, data = null, token = '', expectedStatus = 200) => {
  const startTime = Date.now();
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    const result = {
      method,
      endpoint,
      expectedStatus,
      actualStatus: response.status,
      duration: `${duration}ms`,
      success: response.status === expectedStatus,
      data: response.data
    };
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const result = {
      method,
      endpoint,
      expectedStatus,
      actualStatus: error.response?.status || 'NETWORK_ERROR',
      duration: `${duration}ms`,
      success: false,
      error: error.message,
      responseData: error.response?.data
    };
    
    return result;
  }
};

// Test runner
const runTest = async (testName, testFunction) => {
  console.log(`\n🧪 Testing: ${testName}`);
  
  try {
    const result = await testFunction();
    
    if (result.success) {
      testResults.passed++;
      console.log(`✅ PASS: ${testName} (${result.duration})`);
    } else {
      testResults.failed++;
      console.log(`❌ FAIL: ${testName}`);
      console.log(`   Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      if (result.responseData) console.log(`   Response: ${JSON.stringify(result.responseData)}`);
    }
    
    testResults.details.push({ testName, ...result });
    return result;
  } catch (error) {
    testResults.failed++;
    console.log(`💥 ERROR: ${testName} - ${error.message}`);
    testResults.details.push({ testName, success: false, error: error.message });
    return { success: false, error: error.message };
  }
};

// ===== AUTHENTICATION TESTS =====
const testAuthentication = async () => {
  const tests = [];
  
  // Test login for each user
  for (const [role, user] of Object.entries(TEST_USERS)) {
    const testName = `Login as ${role}`;
    const result = await apiRequest('POST', '/auth/login', {
      email: user.email,
      password: user.password
    }, '', 200);
    
    if (result.success && result.data.token) {
      tokens[role] = result.data.token;
    }
    
    tests.push({ ...result, testName });
  }
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== USER MANAGEMENT TESTS =====
const testUserManagement = async () => {
  const tests = [];
  
  // Admin should be able to get all users
  tests.push(await apiRequest('GET', '/users', null, tokens.admin, 200));
  
  // Brand Owner should NOT be able to get all users (Admin only)
  tests.push(await apiRequest('GET', '/users', null, tokens.brandOwner, 403));
  
  // Test user hierarchy
  tests.push(await apiRequest('GET', '/users/hierarchy', null, tokens.admin, 200));
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== SALES TESTS =====
const testSales = async () => {
  const tests = [];
  
  // Branch Owner can create sales
  const salesData = {
    cash: 150,
    gpay: 75,
    creditCard: 100,
    total: 325
  };
  
  tests.push(await apiRequest('POST', '/sales', salesData, tokens.branchOwner, 201));
  
  // Manager should NOT be able to create sales
  tests.push(await apiRequest('POST', '/sales', salesData, tokens.manager, 403));
  
  // All roles should be able to view sales (with appropriate filtering)
  tests.push(await apiRequest('GET', '/sales', null, tokens.admin, 200));
  tests.push(await apiRequest('GET', '/sales', null, tokens.branchOwner, 200));
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== EXPENSE TESTS =====
const testExpenses = async () => {
  const tests = [];
  
  // Branch Owner can create expenses
  const expenseData = {
    category: 'Supplies',
    amount: 200,
    description: 'Office supplies purchase'
  };
  
  tests.push(await apiRequest('POST', '/expenses', expenseData, tokens.branchOwner, 201));
  
  // Manager should NOT be able to create expenses
  tests.push(await apiRequest('POST', '/expenses', expenseData, tokens.manager, 403));
  
  // Test expense retrieval
  tests.push(await apiRequest('GET', '/expenses', null, tokens.brandOwner, 200));
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== STOCK REQUEST TESTS =====
const testStockRequests = async () => {
  const tests = [];
  
  // Branch Owner can create stock requests
  const stockRequestData = {
    productName: 'Test Product',
    quantity: 50,
    priority: 'Urgent'
  };
  
  tests.push(await apiRequest('POST', '/stockrequests', stockRequestData, tokens.branchOwner, 201));
  
  // Brand Owner can approve stock requests
  // First, get the stock request ID
  const stockRequests = await apiRequest('GET', '/stockrequests', null, tokens.brandOwner, 200);
  if (stockRequests.success && stockRequests.data.length > 0) {
    const requestId = stockRequests.data[0]._id;
    tests.push(await apiRequest('PUT', `/stockrequests/${requestId}/approve`, null, tokens.brandOwner, 200));
  }
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== REPORT TESTS =====
const testReports = async () => {
  const tests = [];
  
  // Test all report types
  const reportEndpoints = [
    '/reports/sales?type=daily',
    '/reports/expenses?type=monthly',
    '/reports/stockrequests',
    '/reports/profit-loss'
  ];
  
  for (const endpoint of reportEndpoints) {
    tests.push(await apiRequest('GET', endpoint, null, tokens.admin, 200));
  }
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== TRANSPORT TESTS =====
const testTransport = async () => {
  const tests = [];
  
  // Brand Owner can create transport (requires stock request ID)
  const stockRequests = await apiRequest('GET', '/stockrequests', null, tokens.brandOwner, 200);
  if (stockRequests.success && stockRequests.data.length > 0) {
    const approvedRequest = stockRequests.data.find(req => req.approved);
    if (approvedRequest) {
      const transportData = {
        stockRequest: approvedRequest._id,
        bundleSize: 10,
        quantity: 100,
        from: 'Warehouse A',
        to: 'Branch Store'
      };
      tests.push(await apiRequest('POST', '/transport', transportData, tokens.brandOwner, 201));
    }
  }
  
  return tests.every(test => test.success) ? { success: true } : { success: false, tests };
};

// ===== MAIN TEST RUNNER =====
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API Tests');
  console.log('='.repeat(50));
  
  // Check server connection
  console.log('\n🔌 Checking server connection...');
  try {
    await axios.get('http://localhost:5000', { timeout: 3000 });
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not responding on http://localhost:5000');
    console.log('Please start your server first: npm run dev');
    return;
  }
  
  // Run test suites
  await runTest('Authentication', testAuthentication);
  await runTest('User Management', testUserManagement);
  await runTest('Sales API', testSales);
  await runTest('Expenses API', testExpenses);
  await runTest('Stock Requests', testStockRequests);
  await runTest('Reports', testReports);
  await runTest('Transport', testTransport);
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Show failed tests details
  const failedTests = testResults.details.filter(test => !test.success);
  if (failedTests.length > 0) {
    console.log('\n🔍 FAILED TESTS DETAILS:');
    failedTests.forEach(test => {
      console.log(`\n❌ ${test.testName}`);
      console.log(`   Endpoint: ${test.method} ${test.endpoint}`);
      console.log(`   Expected: ${test.expectedStatus}, Got: ${test.actualStatus}`);
      if (test.error) console.log(`   Error: ${test.error}`);
    });
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});