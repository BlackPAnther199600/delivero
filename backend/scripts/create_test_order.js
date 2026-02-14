(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@example.com', password: 'password123' })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('Got token:', token ? token.substring(0,20)+'...' : 'none');

    const orderPayload = {
      items: [{ category: 'groceries', description: 'Test order item' }],
      totalAmount: 9.99,
      deliveryAddress: 'Via Roma 1, Milano'
    };

    const createRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orderPayload)
    });

    const createJson = await createRes.json();
    if (!createRes.ok) {
      console.error('Create order failed:', createJson);
      process.exit(1);
    }
    console.log('Created order:', JSON.stringify(createJson, null, 2));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
