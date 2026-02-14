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

async function testDeleteUser() {
    try {
        console.log('Step 1: Login as manager...');
        const loginRes = await makeRequest('POST', '/auth/login', {
            email: 'manager@example.com',
            password: 'password123'
        });

        if (loginRes.status !== 200 || !loginRes.data.token) {
            console.error('❌ Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        const userId = loginRes.data.userId;
        console.log(`✅ Login successful. Token: ${token.substring(0, 30)}...`);
        console.log(`   Manager ID: ${userId}`);

        const headers = { Authorization: `Bearer ${token}` };

        console.log('\nStep 2: Get current users...');
        const usersRes = await makeRequest('GET', '/admin/users', null, headers);
        if (usersRes.status === 200) {
            console.log('✅ Users:', usersRes.data.slice(0, 3).map(u => ({ id: u.id, email: u.email, role: u.role })));
        } else {
            console.error('❌ Failed to get users:', usersRes.data);
        }

        console.log('\nStep 3: Try deleting user ID 5...');
        console.log('   DELETE /api/admin/users/5');
        const deleteRes = await makeRequest('DELETE', '/admin/users/5', null, headers);
        console.log(`   Response: ${deleteRes.status}`, deleteRes.data);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDeleteUser();
