import * as BillPaymentModel from '../models/BillPayment.js';
import * as BillModel from '../models/User.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';

// Create bill payment request
export const createBillPayment = async (req, res) => {
  try {
    const { billId, paymentMethod } = req.body; // paymentMethod: 'cash' or 'prepaid'
    const userId = req.user.id;

    // Get bill to verify and get amount
    const bill = await BillModel.getBillById(billId);
    if (!bill) {
      return res.status(404).json({ message: 'Bolletta non trovata' });
    }

    if (bill.user_id !== userId) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const billPayment = await BillPaymentModel.createBillPayment(
      billId,
      userId,
      paymentMethod,
      bill.amount
    );

    res.status(201).json(billPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Upload barcode/QR code images to S3
export const uploadBillPaymentImages = async (req, res) => {
  try {
    const { billPaymentId } = req.params;
    const { barcode, qrCode } = req.files;

    const billPayment = await BillPaymentModel.getBillPaymentById(billPaymentId);
    if (!billPayment) {
      return res.status(404).json({ message: 'Pagamento bolletta non trovato' });
    }

    if (billPayment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    let barcodeUrl = null;
    let qrCodeUrl = null;

    if (barcode) {
      barcodeUrl = await uploadToS3(barcode[0], 'bill-payments/barcodes');
    }

    if (qrCode) {
      qrCodeUrl = await uploadToS3(qrCode[0], 'bill-payments/qrcodes');
    }

    const updated = await BillPaymentModel.updateBillPaymentImages(
      billPaymentId,
      barcodeUrl,
      qrCodeUrl
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore durante il caricamento', error: error.message });
  }
};

// Get bill payment details
export const getBillPayment = async (req, res) => {
  try {
    const { billPaymentId } = req.params;

    const billPayment = await BillPaymentModel.getBillPaymentById(billPaymentId);
    if (!billPayment) {
      return res.status(404).json({ message: 'Pagamento bolletta non trovato' });
    }

    if (billPayment.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    res.json(billPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get user's bill payments
export const getUserBillPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await BillPaymentModel.getUserBillPayments(userId);
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pending bill payments for rider
export const getPendingBillPayments = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const payments = await BillPaymentModel.getPendingBillPayments(req.user.id);
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Assign rider to bill payment (admin only)
export const assignRider = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono assegnare rider' });
    }

    const { billPaymentId, riderId } = req.body;

    const updated = await BillPaymentModel.assignRiderToBillPayment(billPaymentId, riderId);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Update payment status (rider confirms payment received or collected cash)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { billPaymentId } = req.params;
    const { status, riderPaymentStatus } = req.body;

    const billPayment = await BillPaymentModel.getBillPaymentById(billPaymentId);
    if (!billPayment) {
      return res.status(404).json({ message: 'Pagamento bolletta non trovato' });
    }

    if (billPayment.rider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updated = await BillPaymentModel.updateBillPaymentStatus(
      billPaymentId,
      status,
      riderPaymentStatus
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Add rider notes
export const addNotes = async (req, res) => {
  try {
    const { billPaymentId } = req.params;
    const { notes } = req.body;

    const billPayment = await BillPaymentModel.getBillPaymentById(billPaymentId);
    if (!billPayment) {
      return res.status(404).json({ message: 'Pagamento bolletta non trovato' });
    }

    if (billPayment.rider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updated = await BillPaymentModel.addBillPaymentNotes(billPaymentId, notes);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get bill payment statistics (admin only)
export const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono accedere' });
    }

    const { startDate, endDate } = req.query;
    const stats = await BillPaymentModel.getBillPaymentStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};
