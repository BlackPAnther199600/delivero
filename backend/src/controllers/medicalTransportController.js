import * as MedicalTransportModel from '../models/MedicalTransport.js';

// Create medical transport request
export const createTransport = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      doctorName,
      clinicName,
      clinicAddress,
      clinicPhone,
      pickupAddress,
      pickupLat,
      pickupLon,
      appointmentDate,
      appointmentTime,
      returnTrip,
      specialRequirements
    } = req.body;

    const transport = await MedicalTransportModel.createMedicalTransport(
      userId,
      doctorName,
      clinicName,
      clinicAddress,
      clinicPhone,
      pickupAddress,
      pickupLat,
      pickupLon,
      appointmentDate,
      appointmentTime,
      returnTrip,
      specialRequirements
    );

    res.status(201).json(transport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get user medical transports
export const getUserTransports = async (req, res) => {
  try {
    const userId = req.user.id;
    const transports = await MedicalTransportModel.getUserMedicalTransports(userId);
    res.json(transports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get transport details
export const getTransport = async (req, res) => {
  try {
    const { transportId } = req.params;

    const transport = await MedicalTransportModel.getMedicalTransportById(transportId);
    if (!transport) {
      return res.status(404).json({ message: 'Trasporto non trovato' });
    }

    if (transport.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    res.json(transport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get pending transports for riders
export const getPendingTransports = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Solo i rider possono accedere' });
    }

    const transports = await MedicalTransportModel.getPendingMedicalTransports(req.user.id);
    res.json(transports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Assign rider to transport
export const assignRider = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { riderId } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo gli admin possono assegnare rider' });
    }

    const transport = await MedicalTransportModel.assignRiderToMedicalTransport(transportId, riderId);
    res.json(transport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Rider accept/confirm transport
export const confirmTransport = async (req, res) => {
  try {
    const { transportId } = req.params;

    const transport = await MedicalTransportModel.getMedicalTransportById(transportId);
    if (!transport) {
      return res.status(404).json({ message: 'Trasporto non trovato' });
    }

    const updated = await MedicalTransportModel.updateMedicalTransportStatus(transportId, 'confirmed');
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Update transport status
export const updateStatus = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { status } = req.body;

    const transport = await MedicalTransportModel.getMedicalTransportById(transportId);
    if (!transport) {
      return res.status(404).json({ message: 'Trasporto non trovato' });
    }

    if (transport.rider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updated = await MedicalTransportModel.updateMedicalTransportStatus(transportId, status);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Update transport cost
export const updateCost = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { estimatedCost, actualCost } = req.body;

    const transport = await MedicalTransportModel.getMedicalTransportById(transportId);
    if (!transport) {
      return res.status(404).json({ message: 'Trasporto non trovato' });
    }

    if (transport.rider_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const updated = await MedicalTransportModel.updateMedicalTransportCost(
      transportId,
      estimatedCost,
      actualCost
    );
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Add transport notes
export const addNotes = async (req, res) => {
  try {
    const { transportId } = req.params;
    const { notes } = req.body;

    const transport = await MedicalTransportModel.getMedicalTransportById(transportId);
    if (!transport) {
      return res.status(404).json({ message: 'Trasporto non trovato' });
    }

    const updated = await MedicalTransportModel.addMedicalTransportNotes(transportId, notes);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const { daysAhead = 7 } = req.query;
    const appointments = await MedicalTransportModel.getUpcomingAppointments(parseInt(daysAhead));
    res.json(appointments);
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
    const stats = await MedicalTransportModel.getMedicalTransportStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
};
