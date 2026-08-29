process.env.NODE_ENV = 'test';
import axios from 'axios';
import { startServer } from './src/server.js';
import { disconnectDB } from './src/config/db.js';

const PORT = 5001;
let serverInstance = null;
const BASE_URL = `http://localhost:${PORT}/api`;

const runAuthAndApiTests = async () => {
  console.log('============================================================');
  console.log('CollegeGPT Authentication & Protected API Verification Suite');
  console.log('============================================================\n');

  // Start test server instance on dedicated port
  serverInstance = await startServer(PORT);

  const testEmail = `test_student_${Date.now()}@college.edu`;
  const testPassword = 'Password@123';
  let studentToken = '';
  let adminToken = '';
  let conversationId = '';

  try {
    // 1. Test Health Check
    console.log('--- 1. Health Check Endpoint ---');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    if (healthRes.status === 200 && healthRes.data.service === 'CollegeGPT API') {
      console.log('✅ Health Check: PASSED (Status: 200 OK)');
    } else {
      throw new Error(`Health check returned unexpected payload: ${JSON.stringify(healthRes.data)}`);
    }

    // 2. Test Registration (Valid Student)
    console.log('\n--- 2. Student Registration Flow ---');
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Aditi Deshmukh',
      email: testEmail,
      password: testPassword,
      role: 'student',
    });

    if (regRes.status === 201 && regRes.data.token && regRes.data.user.email === testEmail) {
      studentToken = regRes.data.token;
      console.log('✅ Registration: PASSED (Received JWT token and user profile)');
      if (regRes.data.user.password) {
        throw new Error('SECURITY VIOLATION: Password returned in registration response!');
      }
    } else {
      throw new Error('Registration failed to return token/user');
    }

    // 3. Test Duplicate Registration (Should Fail with 400)
    console.log('\n--- 3. Duplicate Registration Rejection ---');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Aditi Duplicate',
        email: testEmail,
        password: testPassword,
      });
      throw new Error('Duplicate registration should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Duplicate Registration Rejected: PASSED (400 Bad Request)');
      } else {
        throw err;
      }
    }

    // 4. Test Student Login (Valid Credentials)
    console.log('\n--- 4. Student Login Flow ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    if (loginRes.status === 200 && loginRes.data.token) {
      studentToken = loginRes.data.token;
      console.log('✅ Student Login: PASSED (JWT generated)');
      if (loginRes.data.user.password) {
        throw new Error('SECURITY VIOLATION: Password returned in login response!');
      }
    } else {
      throw new Error('Login failed to return token');
    }

    // 5. Test Invalid Credentials Login (Should Fail with 401)
    console.log('\n--- 5. Invalid Password Rejection ---');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: 'WrongPassword999',
      });
      throw new Error('Invalid credentials login should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Invalid Password Rejected: PASSED (401 Unauthorized)');
      } else {
        throw err;
      }
    }

    // 6. Test Non-Existent User Login (Should Fail with 401)
    console.log('\n--- 6. Non-Existent User Login Rejection ---');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'unknown_user_999@college.edu',
        password: 'Password@123',
      });
      throw new Error('Non-existent user login should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Non-Existent User Rejected: PASSED (401 Unauthorized)');
      } else {
        throw err;
      }
    }

    // 7. Test /api/auth/me with Bearer Token
    console.log('\n--- 7. Authenticated User Profile (/api/auth/me) ---');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (meRes.status === 200 && meRes.data.user.email === testEmail) {
      console.log('✅ Auth Me Profile: PASSED (Loaded user without password)');
      if (meRes.data.user.password) {
        throw new Error('SECURITY VIOLATION: Password exposed in /auth/me payload!');
      }
    } else {
      throw new Error('Failed to retrieve user profile with valid JWT');
    }

    // 8. Test Unauthorized API Request (No Token -> 401)
    console.log('\n--- 8. Unauthorized Request Without Token ---');
    try {
      await axios.get(`${BASE_URL}/conversations`);
      throw new Error('Request without token should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ No Token Request Rejected: PASSED (401 Unauthorized)');
      } else {
        throw err;
      }
    }

    // 9. Test Unauthorized API Request (Malformed Token -> 401)
    console.log('\n--- 9. Invalid/Malformed Token Rejection ---');
    try {
      await axios.get(`${BASE_URL}/conversations`, {
        headers: { Authorization: 'Bearer invalid_garbage_token_123' },
      });
      throw new Error('Malformed token request should have been rejected!');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Malformed Token Request Rejected: PASSED (401 Unauthorized)');
      } else {
        throw err;
      }
    }

    // 10. Test Admin Login & Admin Route RBAC
    console.log('\n--- 10. Admin Authentication & Role-Based Access Control (RBAC) ---');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@college.edu',
      password: 'Admin@123',
    });
    adminToken = adminLoginRes.data.token;

    // Student trying to access admin dashboard -> 403 Forbidden
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      throw new Error('Student should not be able to access admin dashboard!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Student Forbidden from Admin Dashboard: PASSED (403 Forbidden)');
      } else {
        throw err;
      }
    }

    // Admin accessing admin dashboard -> 200 OK
    const adminDashRes = await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (adminDashRes.status === 200 && adminDashRes.data.stats) {
      console.log('✅ Admin Access to Dashboard: PASSED (200 OK with metrics)');
    } else {
      throw new Error('Admin dashboard failed');
    }

    // 11. Test Protected Chat API Flow
    console.log('\n--- 11. Protected Chat API Flow (/api/chat) ---');
    const chatRes = await axios.post(
      `${BASE_URL}/chat`,
      {
        collegeId: 'saoe_pune',
        message: 'What are the admission eligibility requirements for B.E. at Sinhgad Academy of Engineering?',
      },
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    if (chatRes.status === 200 && chatRes.data.answer && chatRes.data.sources) {
      conversationId = chatRes.data.conversationId;
      console.log('✅ Protected Chat Query: PASSED (RAG answer generated with sources)');
      console.log(`   Conversation ID: ${conversationId}`);
      console.log(`   Sources count: ${chatRes.data.sources.length}`);
    } else {
      throw new Error('Chat API failed');
    }

    // 12. Test Conversation History Retrieval
    console.log('\n--- 12. Student Conversation History & Message Thread ---');
    const convListRes = await axios.get(`${BASE_URL}/conversations?collegeId=saoe_pune`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (convListRes.status === 200 && convListRes.data.conversations?.length > 0) {
      console.log(`✅ Conversation List: PASSED (Found ${convListRes.data.conversations.length} conversation(s))`);
    } else {
      throw new Error('Failed to retrieve student conversation list');
    }

    const threadRes = await axios.get(`${BASE_URL}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    if (threadRes.status === 200 && threadRes.data.messages?.length >= 2) {
      console.log(`✅ Thread Messages: PASSED (Retrieved ${threadRes.data.messages.length} messages in thread)`);
    } else {
      throw new Error('Failed to retrieve full message thread');
    }

    // 13. Test Conversation Deletion
    console.log('\n--- 13. Delete Conversation ---');
    const delRes = await axios.delete(`${BASE_URL}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (delRes.status === 200) {
      console.log('✅ Delete Conversation: PASSED');
    } else {
      throw new Error('Failed to delete conversation');
    }

    // 14. Test Logout Endpoint
    console.log('\n--- 14. User Logout Endpoint ---');
    const logoutRes = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    if (logoutRes.status === 200) {
      console.log('✅ Logout Endpoint: PASSED');
    }

    console.log('\n============================================================');
    console.log('All Authentication, RBAC & API Tests Passed Successfully!');
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Suite Failed with Error:', error.message);
    if (error.response?.data) {
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }
};

runAuthAndApiTests();
