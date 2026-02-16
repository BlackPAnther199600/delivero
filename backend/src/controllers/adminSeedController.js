import db from '../config/db.js';

/**
 * Admin-only endpoint to trigger seeding manually.
 * Requires admin/manager role.
 */
export const triggerSeed = async (req, res) => {
  try {
    const requesterRole = req.user?.role;
    if (!requesterRole || (requesterRole !== 'admin' && requesterRole !== 'manager')) {
      return res.status(403).json({ message: 'Admin/manager required' });
    }

    // Simple fork: spawn the seed script as detached child process
    const { spawn } = await import('child_process');
    const child = spawn('node', ['scripts/seed_nearby_demo_data.js'], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    res.status(202).json({ message: 'Seed job started (async)' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to start seed job', error: e.message });
  }
};
