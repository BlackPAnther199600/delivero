import { createPaymentIntent, confirmPayment, savePayment, saveCashPayment, getPayment, isStripeConfigured } from '../services/payment.js';
import db from '../config/db.js';
import { sendOrderConfirmation } from '../services/email.js';

export const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    // Verify order exists
    const orderResult = await db.query(
      'SELECT o.*, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = $1 AND o.user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const user = await db.query('SELECT email FROM users WHERE id = $1', [userId]);

    if (!isStripeConfigured()) {
      return res.status(501).json({ message: 'Stripe non configurato sul server' });
    }

    // Always compute amount server-side
    const amount = Number(order.total_amount);

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(amount, orderId, userId, user.rows[0].email);

    // Save payment record
    await savePayment(orderId, paymentIntent.id, amount, 'pending', 'card');

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

export const confirmOrderPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const userId = req.user.userId;

    if (!isStripeConfigured()) {
      return res.status(501).json({ message: 'Stripe non configurato sul server' });
    }

    // Confirm with Stripe
    const isConfirmed = await confirmPayment(paymentIntentId);

    if (!isConfirmed) {
      return res.status(400).json({ message: 'Payment not confirmed' });
    }

    // Update order status
    await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
      ['confirmed', orderId, userId]
    );

    // Update payment status
    await db.query(
      'UPDATE payments SET status = $1 WHERE stripe_payment_id = $2',
      ['completed', paymentIntentId]
    );

    // Get user email and send confirmation
    const userResult = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
    const orderResult = await db.query('SELECT total_amount FROM orders WHERE id = $1', [orderId]);

    await sendOrderConfirmation(
      userResult.rows[0].email,
      orderId,
      orderResult.rows[0].total_amount
    );

    res.status(200).json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};

export const createCashPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const amount = Number(order.total_amount);

    // Create a cash payment record (due on delivery)
    const payment = await saveCashPayment(orderId, amount, 'cash_due');

    // Confirm order (can now be accepted by riders/managers)
    await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3',
      ['confirmed', orderId, userId]
    );

    res.status(201).json({ message: 'Cash payment created', payment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating cash payment', error: error.message });
  }
};

export const markCashCollected = async (req, res) => {
  try {
    const { orderId } = req.body;
    const requesterId = req.user.userId;

    const roleRes = await db.query('SELECT role FROM users WHERE id = $1', [requesterId]);
    const role = roleRes.rows[0]?.role;
    if (role !== 'admin' && role !== 'manager' && role !== 'rider') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payRes = await db.query(
      `UPDATE payments
       SET status = 'completed', updated_at = NOW()
       WHERE order_id = $1 AND payment_method = 'cash'
       RETURNING *`,
      [orderId]
    );

    if (payRes.rows.length === 0) {
      return res.status(404).json({ message: 'Cash payment not found for order' });
    }

    res.status(200).json({ message: 'Cash marked as collected', payment: payRes.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cash payment', error: error.message });
  }
};
