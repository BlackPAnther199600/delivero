import stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../config/db.js';

dotenv.config();

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (amount, orderId, userId, email) => {
  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        orderId,
        userId
      },
      receipt_email: email
    });

    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    throw error;
  }
};

export const savePayment = async (orderId, paymentIntentId, amount, status) => {
  try {
    const result = await db.query(
      'INSERT INTO payments (order_id, stripe_payment_id, amount, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [orderId, paymentIntentId, amount, status]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getPayment = async (paymentIntentId) => {
  try {
    const result = await db.query(
      'SELECT * FROM payments WHERE stripe_payment_id = $1',
      [paymentIntentId]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
