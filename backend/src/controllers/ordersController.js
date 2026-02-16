import db from '../config/db.js';
import { emitOrderUpdate, broadcastRiderLocation, broadcastOrderStatusChange } from '../services/socket.js';

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero degli ordini', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero ordine', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    // Support two payload shapes:
    // 1) API-style: { restaurantId, items, totalAmount, deliveryAddress }
    // 2) Mobile simplified: { category, description, address, total_price }
    const userId = req.user.userId;

    let { restaurantId, items, totalAmount, deliveryAddress } = req.body;

    // Also accept alternative/mobile field names
    const { total_price, address, category, description } = req.body;

    // If mobile simplified payload, map to expected fields
    if ((!items || (Array.isArray(items) && items.length === 0)) && description) {
      items = [{ category: category || null, description }];
      totalAmount = totalAmount ?? total_price;
      deliveryAddress = deliveryAddress ?? address;
      restaurantId = restaurantId ?? null;
    }

    // If items were passed but look like PowerShell/hash string, try to normalize
    if (Array.isArray(items) && items.length > 0 && typeof items[0] === 'string') {
      // attempt to parse if it's a JSON string
      try {
        const parsed = items.map(it => {
          if (typeof it === 'string') {
            const trimmed = it.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
              return JSON.parse(trimmed);
            }
            // fallback: try to extract key=value pairs from PowerShell hashtable string like "@{category=food; description=...}"
            const match = trimmed.match(/\{?@?\{?([^}]+)\}?\}?/);
            if (match && match[1]) {
              const pairs = match[1].split(/[;|,]/).map(s => s.trim()).filter(Boolean);
              const obj = {};
              pairs.forEach(p => {
                const kv = p.split('=');
                if (kv.length >= 2) {
                  const k = kv[0].trim();
                  const v = kv.slice(1).join('=').trim();
                  obj[k] = v.replace(/^['"]|['"]$/g, '');
                }
              });
              return obj;
            }
          }
          return it;
        });
        items = parsed;
      } catch (e) {
        // leave items as-is if parsing fails
      }
    }

    // Normalize numeric totalAmount
    if (typeof totalAmount === 'string') {
      totalAmount = parseFloat(totalAmount);
    }

    if (!items || !totalAmount || !deliveryAddress) {
      return res.status(400).json({ message: 'Campi obbligatori mancanti' });
    }

    // Allow delivery latitude/longitude
    const { delivery_latitude, delivery_longitude } = req.body;

    const result = await db.query(
      'INSERT INTO orders (user_id, restaurant_id, items, total_amount, delivery_address, delivery_latitude, delivery_longitude, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, restaurantId, JSON.stringify(items), totalAmount, deliveryAddress, delivery_latitude || null, delivery_longitude || null, 'pending']
    );

    res.status(201).json({ message: 'Ordine creato', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nella creazione ordine', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;
    const userId = req.user.userId;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit real-time update via Socket.IO
    emitOrderUpdate(userId, id, status, location);

    res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Get available orders for riders
export const getAvailableOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM orders 
       WHERE status = 'pending' 
       ORDER BY created_at ASC 
       LIMIT 50`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero ordini disponibili', error: error.message });
  }
};

// Rider accepts order
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user.userId;

    const result = await db.query(
      `UPDATE orders 
       SET status = 'accepted', rider_id = $1, updated_at = NOW() 
       WHERE id = $2 AND status = 'pending' 
       RETURNING *`,
      [riderId, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Ordine non disponibile o già accettato' });
    }

    res.status(200).json({ message: 'Ordine accettato', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'accettazione ordine', error: error.message });
  }
};

// Get active rider orders
export const getActiveRiderOrders = async (req, res) => {
  try {
    const riderId = req.user.userId;

    const result = await db.query(
      `SELECT * FROM orders 
       WHERE rider_id = $1 AND status IN ('accepted', 'pickup', 'in_transit', 'delivered') 
       ORDER BY updated_at DESC`,
      [riderId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero ordini attivi', error: error.message });
  }
};

// Complete delivery
export const completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user.userId;

    const result = await db.query(
      `UPDATE orders 
       SET status = 'delivered', updated_at = NOW() 
       WHERE id = $1 AND rider_id = $2 
       RETURNING *`,
      [id, riderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    res.status(200).json({ message: 'Consegna completata', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel completamento consegna', error: error.message });
  }
};

// Rate order (customer rates rider or rider rates customer)
export const rateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, notes } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating deve essere tra 1 e 5' });
    }

    const result = await db.query(
      `UPDATE orders 
       SET status = 'rated', rating = $1, rating_notes = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [rating, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    res.status(200).json({ message: 'Valutazione salvata', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nel salvataggio valutazione', error: error.message });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await db.query(
      `UPDATE orders 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'accepted') 
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Non è possibile annullare questo ordine' });
    }

    res.status(200).json({ message: 'Ordine annullato', order: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'annullamento ordine', error: error.message });
  }
};

// Track order - Get order details with rider tracking info
export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Customer can see their own orders, riders can see orders they're assigned to
    let query = 'SELECT id, status, rider_id, delivery_address, created_at, updated_at, rider_latitude, rider_longitude, eta_minutes, received_at, user_id, total_amount, items FROM orders WHERE id = $1';
    let queryParams = [id];

    if (userRole === 'customer') {
      query += ' AND user_id = $2';
      queryParams.push(userId);
    } else if (userRole === 'rider' || userRole === 'manager') {
      // Riders and managers can see orders they're assigned to or any order
      if (userRole === 'rider') {
        query += ' AND rider_id = $2';
        queryParams.push(userId);
      }
      // Managers can see all orders (no additional WHERE clause)
    }

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ordine non trovato o non autorizzato' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel tracciamento ordine', error: error.message });
  }
};

// Update rider location
export const updateRiderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const riderId = req.user.userId;
    const { latitude, longitude, eta_minutes } = req.body;

    // Validate input
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude e longitude sono obbligatori' });
    }

    // Verify rider has this order and get customer id + delivery coords
    const orderRes = await db.query('SELECT id, user_id, status, delivery_latitude, delivery_longitude FROM orders WHERE id = $1 AND rider_id = $2', [id, riderId]);
    if (orderRes.rows.length === 0) {
      return res.status(403).json({ message: 'Non autorizzato per questo ordine' });
    }
    const order = orderRes.rows[0];
    if (!['accepted', 'pickup', 'in_transit'].includes(order.status)) {
      return res.status(400).json({ message: 'Ordine non in stato tracciabile' });
    }

    // Update location on order
    const result = await db.query(
      `UPDATE orders 
       SET 
        rider_latitude = $1,
        rider_longitude = $2,
        eta_minutes = COALESCE($3, eta_minutes),
        received_at = COALESCE(received_at, NOW()),
        updated_at = NOW()
       WHERE id = $4
       RETURNING id, status, rider_latitude, rider_longitude, eta_minutes, updated_at`,
      [latitude, longitude, eta_minutes || null, id]
    );

    const tracking = result.rows[0];

    // Persist track point for history
    try {
      await db.query(
        `INSERT INTO order_tracks (order_id, latitude, longitude, recorded_at) VALUES ($1, $2, $3, NOW())`,
        [id, latitude, longitude]
      );
    } catch (e) {
      console.warn('Could not insert track point:', e.message);
    }

    // Emit websocket updates: to customer and to managers via order channel
    broadcastRiderLocation(id, latitude, longitude, tracking.eta_minutes || null);

    // Check proximity for push notifications
    let shouldPush = false;
    if (tracking.eta_minutes !== null && tracking.eta_minutes <= 5) {
      shouldPush = true;
    }

    // also if we have delivery coords, compute distance and push if within threshold
    if (!shouldPush && order.delivery_latitude && order.delivery_longitude) {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371000; // meters
      const dLat = toRad(order.delivery_latitude - latitude);
      const dLon = toRad(order.delivery_longitude - longitude);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(latitude)) * Math.cos(toRad(order.delivery_latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      if (dist <= 500) {
        shouldPush = true;
      }
    }

    // server-side push via FCM if configured
    if (shouldPush) {
      try {
        const push = await import('../services/push.js');
        await push.sendPushToUser(order.user_id, { title: 'Il tuo rider è vicino!', body: `Preparati per la consegna!` });
      } catch (e) {
        console.warn('Push send failed:', e.message);
      }
    }

    res.status(200).json({
      message: 'Posizione aggiornata',
      tracking
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore nell\'aggiornamento posizione', error: error.message });
  }
};

// Get track history for an order
export const getTrackHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order exists and get user_id
    const orderCheck = await db.query(
      'SELECT id, user_id FROM orders WHERE id = $1',
      [id]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Ordine non trovato' });
    }

    // Get tracking history
    const result = await db.query(
      `SELECT latitude, longitude, recorded_at FROM order_tracks WHERE order_id = $1 ORDER BY recorded_at ASC`,
      [id]
    );

    // Return empty array if no tracking data found
    res.status(200).json(result.rows || []);
  } catch (error) {
    console.error('Error in getTrackHistory:', error);
    res.status(500).json({
      message: 'Errore nel recupero storico tracciamento',
      error: error.message
    });
  }
};

// Get all active orders (for manager dashboard)
export const getActiveOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
        o.id,
        o.status,
        o.rider_id,
        o.user_id,
        o.delivery_address,
        o.rider_latitude,
        o.rider_longitude,
        o.eta_minutes,
        o.received_at,
        o.total_amount,
        o.created_at,
        o.updated_at,
        u.name as rider_name,
        c.name as customer_name
       FROM orders o
       LEFT JOIN users u ON o.rider_id = u.id
       LEFT JOIN users c ON o.user_id = c.id
       WHERE o.status IN ('pending', 'accepted', 'pickup', 'in_transit')
       ORDER BY o.created_at DESC`,
      []
    );

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero ordini attivi', error: error.message });
  }
};
