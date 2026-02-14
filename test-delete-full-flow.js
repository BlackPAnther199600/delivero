const BASE_URL = 'http://localhost:5000/api';

async function makeRequest(method, endpoint, body, headers = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return { status: response.status, data };
}

async function testFullDeleteFlow() {
    try {
        // Step 1: Login as manager
        console.log('📝 Step 1: Login as manager...');
        const loginRes = await makeRequest('POST', '/auth/login', {
            email: 'manager@example.com',
            password: 'password123'
        });

        if (loginRes.status !== 200 || !loginRes.data.token) {
            console.error('❌ Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Manager logged in');

        // Step 2: Get current users
        console.log('\n📝 Step 2: Get current users...');
        const usersRes = await makeRequest('GET', '/admin/users', null, headers);
        if (usersRes.status !== 200) {
            console.error('❌ Failed to get users:', usersRes.data);
            return;
        }
        console.log(`✅ Found ${usersRes.data.length} users`);
        usersRes.data.forEach(u => {
            console.log(`   - ID ${u.id}: ${u.email} (${u.role})`);
        });

        // Step 3: Create test user
        console.log('\n📝 Step 3: Create test user...');
        const testEmail = `test_${Date.now()}@example.com`;
        const registerRes = await makeRequest('POST', '/auth/register', {
            name: `Test User ${Date.now()}`,
            email: testEmail,
            password: 'testpass123',
            role: 'customer'
        });

        if (registerRes.status !== 201) {
            console.error('❌ Registration failed:', registerRes.data);
            return;
        }
        const testUserId = registerRes.data.user.id;
        console.log(`✅ Test user created: ID ${testUserId} (${testEmail})`);

        // Step 4: Delete the test user
        console.log(`\n📝 Step 4: Delete test user ${testUserId}...`);
        const deleteRes = await makeRequest('DELETE', `/admin/users/${testUserId}`, null, headers);

        if (deleteRes.status === 200) {
            console.log(`✅ User ${testUserId} deleted successfully`);
        } else {
            console.error(`❌ Delete failed: ${deleteRes.status}`, deleteRes.data);
            return;
        }

        // Step 5: Verify user is deleted
        console.log('\n📝 Step 5: Verify user is deleted...');
        const verifyRes = await makeRequest('GET', '/admin/users', null, headers);
        const userExists = verifyRes.data.some(u => u.id === testUserId);

        if (!userExists) {
            console.log(`✅ Confirmed: User ${testUserId} no longer exists`);
        } else {
            console.error(`❌ User ${testUserId} still exists!`);
        }

        console.log('\n✨ Complete flow test PASSED!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFullDeleteFlow();
