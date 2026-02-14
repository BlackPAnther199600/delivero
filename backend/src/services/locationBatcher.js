import db from '../config/db.js';

// In-memory buffer for location updates: order_id -> { latitude, longitude, eta_minutes, user_id, rider_id, delivery_latitude, delivery_longitude }
const locationUpdateBuffer = new Map();
const BATCH_FLUSH_INTERVAL = 30000; // 30 seconds
const ETA_CHANGE_THRESHOLD = 2; // minutes - flush if ETA changes by 2+

let flushInterval = null;

export function initLocationBatcher(io) {
    if (flushInterval) return;

    flushInterval = setInterval(async () => {
        const entries = Array.from(locationUpdateBuffer.entries());
        if (entries.length === 0) return;

        // Batch flush triggered for buffered location updates

        for (const [orderId, data] of entries) {
            try {
                const { latitude, longitude, eta_minutes, user_id, rider_id, delivery_latitude, delivery_longitude } = data;

                // Write to DB
                await db.query(
                    `UPDATE orders 
           SET rider_latitude = $1, rider_longitude = $2, eta_minutes = COALESCE($3, eta_minutes), 
               received_at = COALESCE(received_at, NOW()), updated_at = NOW()
           WHERE id = $4`,
                    [latitude, longitude, eta_minutes || null, orderId]
                );

                // Write track point
                try {
                    await db.query(
                        `INSERT INTO order_tracks (order_id, latitude, longitude, recorded_at) VALUES ($1, $2, $3, NOW())`,
                        [orderId, latitude, longitude]
                    );
                } catch (e) {
                    console.warn('[Batcher] Track insert failed:', e.message);
                }

                // Check proximity and emit
                checkProximityAndEmit(io, orderId, latitude, longitude, eta_minutes, user_id, delivery_latitude, delivery_longitude);

                locationUpdateBuffer.delete(orderId);
            } catch (e) {
                console.error(`[Batcher] Flush failed for order ${orderId}:`, e.message);
            }
        }
    }, BATCH_FLUSH_INTERVAL);
}

function checkProximityAndEmit(io, orderId, lat, lon, eta_minutes, user_id, delivery_lat, delivery_lon) {
    try {
        if (!io) return;

        // Emit to customer and managers
        io.to(`user_${user_id}`).emit('trackingUpdate', {
            orderId, latitude: lat, longitude: lon, eta_minutes, timestamp: new Date()
        });
        io.to('managers').emit('activeOrderUpdate', {
            orderId, latitude: lat, longitude: lon, eta_minutes, timestamp: new Date()
        });

        // Check proximity: ETA-based
        let shouldNotify = false;
        if (eta_minutes !== null && eta_minutes <= 5) {
            shouldNotify = true;
        }

        // Or distance-based
        if (!shouldNotify && delivery_lat && delivery_lon) {
            const dist = haversineDistance(lat, lon, delivery_lat, delivery_lon);
            if (dist <= 500) {
                shouldNotify = true;
            }
        }

        if (shouldNotify) {
            io.to(`user_${user_id}`).emit('riderNearby', { orderId, eta_minutes });
            // Push notification async (non-blocking)
            import('./push.js').then(p => {
                p.sendPushToUser(user_id, {
                    title: 'Il tuo rider è vicino',
                    body: eta_minutes ? `ETA: ${eta_minutes} minuti` : 'Il rider è a meno di 500m'
                }).catch(e => console.warn('Push send failed:', e.message));
            });
        }
    } catch (e) {
        console.warn('[Batcher] checkProximityAndEmit failed:', e.message);
    }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function bufferLocationUpdate(orderId, latitude, longitude, eta_minutes, user_id, rider_id, delivery_latitude, delivery_longitude, lastKnownEta) {
    const incoming = { latitude, longitude, eta_minutes, user_id, rider_id, delivery_latitude, delivery_longitude };
    const existing = locationUpdateBuffer.get(orderId);

    // If buffered and ETA change is small, just update buffer
    const etaDiff = existing && lastKnownEta ? Math.abs((lastKnownEta || 0) - (eta_minutes || 0)) : 999;

    if (existing && etaDiff < ETA_CHANGE_THRESHOLD) {
        locationUpdateBuffer.set(orderId, incoming);
        return { buffered: true, flushed: false };
    }

    // Otherwise, treat as immediate write (or delete from buffer if exists and flush soon)
    locationUpdateBuffer.delete(orderId);
    return { buffered: false, flushed: false };
}

export function stopLocationBatcher() {
    if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
    }
}

export function getBufferStats() {
    return {
        bufferedOrders: locationUpdateBuffer.size,
        orders: Array.from(locationUpdateBuffer.keys()),
    };
}

export default { initLocationBatcher, bufferLocationUpdate, stopLocationBatcher, getBufferStats };
