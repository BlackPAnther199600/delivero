import * as DocumentPickupModel from '../models/DocumentPickup.js';

// Create document pickup request
export const createPickup = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      documentType,
      pickupLocation,
      pickupLat,
      pickupLon,
      deliveryAddress,
      deliveryLat,
      deliveryLon,
      estimatedCost,
      description,
      signatureRequired = false
    } = req.body;

    const pickup = await DocumentPickupModel.createDocumentPickup(
      userId,
      documentType,
      pickupLocation,
      pickupLat,
      pickupLon,
      deliveryAddress,
      deliveryLat,
      deliveryLon,
      estimatedCost,
      description,
      signatureRequired
    );

    res.status(201).json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get user document pickups
export const getUserPickups = async (req, res) => {
  try {
    const userId = req.user.id;
    const pickups = await DocumentPickupModel.getUserDocumentPickups(userId);
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pickup details
export const getPickup = async (req, res) => {
  try {
    const { pickupId } = req.params;

    const pickup = await DocumentPickupModel.getDocumentPickupById(pickupId);
    if (!pickup) {
      return res.status(404).json({ message: 'Ritiro documento non trovato' });
    }

    if (pickup.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Track pickup by tracking number (public access)
export const trackPickup = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const pickup = await DocumentPickupModel.getDocumentPickupByTracking(trackingNumber);
    if (!pickup) {
      return res.status(404).json({ message: 'Documenti non trovati' });
    }

    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pending pickups for riders
export const getPendingPickups = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const pickups = await DocumentPickupModel.getPendingDocumentPickups(req.user.id);
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get rider's active pickups
export const getRiderActivePickups = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const pickups = await DocumentPickupModel.getRiderActivePickups(req.user.id);
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Assign rider to pickup
export const assignRider = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { riderId } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono assegnare rider' });
    }

    const pickup = await DocumentPickupModel.assignRiderToDocumentPickup(pickupId, riderId);
    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Update pickup status
export const updateStatus = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { status } = req.body;

    const pickup = await DocumentPickupModel.getDocumentPickupById(pickupId);
    if (!pickup) {
      return res.status(404).json({ message: 'Ritiro documento non trovato' });
    }

    if (pickup.rider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updated = await DocumentPickupModel.updateDocumentPickupStatus(pickupId, status);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get rider active pickups
export const getRiderAssignedPickups = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const pickups = await DocumentPickupModel.getRiderActivePickups(req.user.id);
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get statistics (admin only)
export const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono accedere' });
    }

    const { startDate, endDate } = req.query;
    const stats = await DocumentPickupModel.getDocumentPickupStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get document type statistics
export const getDocumentTypeStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono accedere' });
    }

    const stats = await DocumentPickupModel.getDocumentTypeStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};
