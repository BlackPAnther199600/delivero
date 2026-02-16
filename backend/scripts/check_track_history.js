(async () => {
    try {
        const login = await fetch('https://delivero-gyjx.onrender.com/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'customer@example.com', password: 'password123' }) });
        const loginJ = await login.json();
        console.log('login status', login.status);
        const token = loginJ.token;
        const res = await fetch('https://delivero-gyjx.onrender.com/api/orders/22/track-history', { headers: { Authorization: `Bearer ${token}` } });
        console.log('track-history status', res.status);
        const text = await res.text();
        console.log('body raw:', text);
        try { console.log('parsed json:', JSON.parse(text)); } catch (e) { console.log('not json'); }
    } catch (e) { console.error(e); process.exit(1); }
})();
