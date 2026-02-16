import { io } from 'socket.io-client';

const API = 'https://delivero-gyjx.onrender.com/api';

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const j = await res.json();
  if (!res.ok) throw new Error('Login failed: ' + JSON.stringify(j));
  return j.token;
}

async function run() {
  try {
    console.log('Logging in users...');
    const customerToken = await login('customer@example.com', 'password123');
    const riderToken = await login('rider@example.com', 'password123');
    const managerToken = await login('manager@example.com', 'password123');
    console.log('Tokens ok');

    // connect sockets
    const customerSocket = io('http://localhost:5000', { auth: { token: customerToken }, transports: ['websocket'] });
    const riderSocket = io('http://localhost:5000', { auth: { token: riderToken }, transports: ['websocket'] });
    const managerSocket = io('http://localhost:5000', { auth: { token: managerToken }, transports: ['websocket'] });

    customerSocket.on('connect', () => {
      console.log('Customer socket connected', customerSocket.id);
      customerSocket.emit('joinUserRoom', '2');
    });
    managerSocket.on('connect', () => {
      console.log('Manager socket connected', managerSocket.id);
      managerSocket.emit('joinManagerRoom');
    });
    riderSocket.on('connect', () => console.log('Rider socket connected', riderSocket.id));

    customerSocket.on('trackingUpdate', (data) => console.log('Customer received trackingUpdate', data));
    customerSocket.on('riderNearby', (data) => console.log('Customer received riderNearby', data));
    managerSocket.on('activeOrderUpdate', (data) => console.log('Manager received activeOrderUpdate', data));

    // Create order as customer
    console.log('Creating order...');
    const createRes = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` }, body: JSON.stringify({ items: [{ category: 'test', description: 'integ test' }], totalAmount: 5.5, deliveryAddress: 'Test address 1' }) });
    const createJson = await createRes.json();
    console.log('Order created', createJson.order.id);
    const orderId = createJson.order.id;

    // Rider accepts order
    console.log('Rider accepting order...');
    const acceptRes = await fetch(`${API}/orders/${orderId}/accept`, { method: 'PUT', headers: { 'Authorization': `Bearer ${riderToken}` } });
    console.log('Accept status', acceptRes.status);

    // Simulate rider sending locations
    for (let i = 0; i < 3; i++) {
      const lat = 45.0 + Math.random() * 0.01;
      const lon = 9.0 + Math.random() * 0.01;
      const eta = 10 - i * 3;
      const locRes = await fetch(`${API}/orders/${orderId}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${riderToken}` }, body: JSON.stringify({ latitude: lat, longitude: lon, eta_minutes: eta }) });
      console.log('Location update', i, await locRes.json());
      await new Promise(r => setTimeout(r, 1000));
    }

    // Fetch track history
    const hist = await (await fetch(`${API}/orders/${orderId}/track-history`, { headers: { 'Authorization': `Bearer ${customerToken}` } })).json();
    console.log('Track history points:', hist.length);

    // Cleanup sockets after short delay
    await new Promise(r => setTimeout(r, 2000));
    customerSocket.disconnect();
    riderSocket.disconnect();
    managerSocket.disconnect();

    console.log('Integration test completed');
  } catch (e) {
    console.error('Integration test error', e.message);
    process.exit(1);
  }
}

run();
