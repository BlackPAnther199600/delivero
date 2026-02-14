#!/usr/bin/env node
/**
 * Simple end-to-end admin smoke tests.
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret node e2e_admin_test.js
 * Or set ADMIN_TOKEN to skip login.
 */
// Uses global fetch (Node 18+). If your Node doesn't support global fetch, install node-fetch and modify the import.

const BASE = process.env.BASE_URL || 'http://localhost:5000/api';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const tokenEnv = process.env.ADMIN_TOKEN;

async function run() {
    let token = tokenEnv;
    if (!token) {
        if (!email || !password) {
            console.error('Provide ADMIN_EMAIL and ADMIN_PASSWORD or ADMIN_TOKEN');
            process.exit(1);
        }
        const res = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            console.error('Login failed', await res.text());
            process.exit(2);
        }
        const j = await res.json();
        token = j.token || j.accessToken || j.data?.token;
        console.log('Login OK, token obtained');
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Call admin stats
    console.log('\nCalling /admin/stats...');
    const s = await fetch(`${BASE}/admin/stats`, { headers });
    console.log('Status', s.status);
    console.log(await s.text());

    // Create a test ticket
    console.log('\nCreating test ticket...');
    const t = await fetch(`${BASE}/tickets`, { method: 'POST', headers, body: JSON.stringify({ title: 'E2E test ticket', type: 'bug', message: 'Automated test' }) });
    console.log('Create ticket status', t.status);
    console.log(await t.text());

    // List admin users
    console.log('\nListing admin users...');
    const u = await fetch(`${BASE}/admin/users`, { headers });
    console.log('Users status', u.status);
    const users = await u.json();
    console.log('Users count', Array.isArray(users) ? users.length : 'n/a');

    console.log('\nE2E test finished.');
}

run().catch(e => { console.error('E2E script error', e); process.exit(99); });
