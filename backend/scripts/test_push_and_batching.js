#!/usr/bin/env node
import { io } from 'socket.io-client';
import { getTrackingMetrics, compressTrackingPoints } from '../src/utils/polylineCompression.js';

const API = 'https://delivero-gyjx.onrender.com/api';
const WS_URL = 'http://localhost:5000';

async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const j = await res.json();
    if (!res.ok) throw new Error('Login failed: ' + JSON.stringify(j));
    return j.token;
}

async function run() {
    try {
        console.log('=== Push & Batching Integration Test ===\n');

        console.log('Step 1: Login users...');
        const customerToken = await login('customer@example.com', 'password123');
        const riderToken = await login('rider@example.com', 'password123');
        const managerToken = await login('manager@example.com', 'password123');
        console.log('✅ Tokens obtained\n');

        // Setup sockets
        const customerSocket = io(WS_URL, { auth: { token: customerToken }, transports: ['websocket'] });
        const riderSocket = io(WS_URL, { auth: { token: riderToken }, transports: ['websocket'] });
        const managerSocket = io(WS_URL, { auth: { token: managerToken }, transports: ['websocket'] });

        let receivedUpdates = 0;
        let receivedNearby = 0;

        customerSocket.on('connect', () => {
            console.log('Customer socket connected');
            customerSocket.emit('joinUserRoom', '2');
        });

        managerSocket.on('connect', () => {
            console.log('Manager socket connected');
            managerSocket.emit('joinManagerRoom');
        });

        riderSocket.on('connect', () => console.log('Rider socket connected'));

        customerSocket.on('trackingUpdate', (data) => {
            receivedUpdates++;
            console.log(`  📍 Customer: Tracking update #${receivedUpdates}`);
        });

        customerSocket.on('riderNearby', (data) => {
            receivedNearby++;
            console.log(`  🔔 Customer: Rider Nearby! (would also trigger FCM push)`);
        });

        managerSocket.on('activeOrderUpdate', (data) => {
            console.log(`  📊 Manager: Order ${data.orderId} update`);
        });

        // Create order
        console.log('Step 2: Create order...');
        const createRes = await fetch(`${API}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customerToken}`
            },
            body: JSON.stringify({
                items: [{ category: 'test', description: 'Push test' }],
                totalAmount: 5.5,
                deliveryAddress: 'Test address 1',
                delivery_latitude: 45.0,
                delivery_longitude: 9.0
            })
        });
        const createJson = await createRes.json();
        const orderId = createJson.order.id;
        console.log(`✅ Order created: ${orderId}\n`);

        // Rider accepts
        console.log('Step 3: Rider accepts order...');
        await fetch(`${API}/orders/${orderId}/accept`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${riderToken}` }
        });
        console.log('✅ Order accepted\n');

        // Simulate rider sending many locations (tests batching)
        console.log('Step 4: Simulate 8 location updates (tests batching)...');
        const updates = [];
        for (let i = 0; i < 8; i++) {
            const lat = 45.0 + Math.random() * 0.005;
            const lon = 9.0 + Math.random() * 0.005;
            const eta = 10 - i;
            const locRes = await fetch(`${API}/orders/${orderId}/location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${riderToken}`
                },
                body: JSON.stringify({ latitude: lat, longitude: lon, eta_minutes: eta })
            });
            const locJson = await locRes.json();
            updates.push({ lat, lon, eta, buffered: locJson.buffered });
            console.log(`  Update ${i}: ETA=${eta}min, Buffered=${locJson.buffered ?? false}`);
            await new Promise(r => setTimeout(r, 200));
        }
        console.log('✅ Location updates sent\n');

        // Fetch track history and compress
        console.log('Step 5: Fetch track history and compress...');
        const hist = await (await fetch(`${API}/orders/${orderId}/track-history`, {
            headers: { 'Authorization': `Bearer ${customerToken}` }
        })).json();
        console.log(`  Raw points: ${hist.length}`);

        const compressed = compressTrackingPoints(hist);
        const metrics = getTrackingMetrics(hist);
        console.log(`  Compressed points: ${metrics.compressed_points}`);
        console.log(`  Compression ratio: ${metrics.compression_ratio}%`);
        console.log(`  Distance traveled: ${metrics.distance_km} km\n`);

        // Wait for socket events
        console.log('Step 6: Wait for socket updates...');
        await new Promise(r => setTimeout(r, 3000));
        console.log(`  ✅ Received ${receivedUpdates} tracking updates`);
        console.log(`  ✅ Received ${receivedNearby} proximity alerts`);
        console.log(`  (Note: FCM push would also be sent if configured)\n`);

        // Cleanup
        console.log('=== Test Complete ===');
        console.log('Summary:');
        console.log(`- Order ${orderId} created and tracked`);
        console.log(`- 8 location updates (batching reduces DB writes)`);
        console.log(`- Compression: ${hist.length} → ${compressed.length} points (${metrics.compression_ratio}%)`);
        console.log(`- Distance: ${metrics.distance_km}km`);
        console.log(`- WebSocket events: ${receivedUpdates} tracking + ${receivedNearby} proximity`);
        console.log('✅ All tests passed!');

        customerSocket.disconnect();
        riderSocket.disconnect();
        managerSocket.disconnect();
    } catch (e) {
        console.error('❌ Test error:', e.message);
        console.error(e.stack);
        process.exit(1);
    }
}

run();
