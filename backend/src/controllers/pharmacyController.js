import * as PharmacyModel from '../models/Pharmacy.js';
import { uploadToS3 } from '../utils/s3.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import jwt from 'jsonwebtoken';

// Pharmacy registration
export const registerPharmacy = async (req, res) => {
  try {
    const { email, password, name, phone, address, city, postalCode, licenseNumber, lat, lon } = req.body;

    // Check if pharmacy already exists
    const existing = await PharmacyModel.getPharmacyByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Farmacia già registrata' });
    }

    const pharmacy = await PharmacyModel.createPharmacy(
      email,
      password,
      name,
      phone,
      address,
      city,
      postalCode,
      licenseNumber,
      lat,
      lon
    );

    res.status(201).json({
      message: 'Farmacia registrata con successo. Pending approvazione admin.',
      pharmacy
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get all pharmacies (customers can search)
export const getPharmacies = async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    const pharmacies = await PharmacyModel.getAllPharmacies(lat, lon, radius);
    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pharmacy details
export const getPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const pharmacy = await PharmacyModel.getPharmacyById(pharmacyId);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Farmacia non trovata' });
    }

    res.json(pharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pharmacy products
export const getPharmacyProducts = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const products = await PharmacyModel.getPharmacyProducts(pharmacyId);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Add pharmacy product (pharmacy admin only)
export const addProduct = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { name, description, category, price, stockQuantity } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToS3(req.file, 'pharmacy-products');
    }

    const product = await PharmacyModel.addPharmacyProduct(
      pharmacyId,
      name,
      description,
      category,
      price,
      stockQuantity,
      imageUrl
    );

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Create pharmacy order (customer)
export const createOrder = async (req, res) => {
  try {
    const { pharmacyId, items, deliveryAddress, lat, lon } = req.body;
    const userId = req.user.id;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await PharmacyModel.createPharmacyOrder(
      userId,
      pharmacyId,
      items,
      totalAmount,
      deliveryAddress,
      lat,
      lon
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get user pharmacy orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await PharmacyModel.getUserPharmacyOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pharmacy orders (pharmacy admin)
export const getPharmacyOrders = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { status } = req.query;

    const orders = await PharmacyModel.getPharmacyOrdersForPharmacy(pharmacyId, status);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pending orders for riders
export const getPendingOrders = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const orders = await PharmacyModel.getPendingPharmacyOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Assign rider to order
export const assignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono assegnare rider' });
    }

    const order = await PharmacyModel.assignRiderToPharmacyOrder(orderId, riderId);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const order = await PharmacyModel.updatePharmacyOrderStatus(orderId, status, notes);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Verify pharmacy (admin only)
export const verifyPharmacy = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono approvare farmacie' });
    }

    const { pharmacyId } = req.params;
    const pharmacy = await PharmacyModel.verifyPharmacy(pharmacyId);
    res.json(pharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};
