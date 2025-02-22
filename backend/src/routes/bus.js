const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.database();

// Get all buses
router.get('/', async (req, res) => {
  try {
    const busesRef = db.ref('buses');
    const snapshot = await busesRef.once('value');
    const buses = snapshot.val();
    res.json(buses || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching buses' });
  }
});

// Get specific bus location
router.get('/:busId/location', async (req, res) => {
  try {
    const { busId } = req.params;
    const locationRef = db.ref(`buses/${busId}/location`);
    const snapshot = await locationRef.once('value');
    const location = snapshot.val();
    
    if (!location) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bus location' });
  }
});

// Update bus location (protected route for bus drivers/admin)
router.put('/:busId/location', async (req, res) => {
  try {
    const { busId } = req.params;
    const { latitude, longitude, speed, timestamp } = req.body;
    
    const locationRef = db.ref(`buses/${busId}/location`);
    await locationRef.set({
      latitude,
      longitude,
      speed,
      timestamp,
      lastUpdate: admin.database.ServerValue.TIMESTAMP
    });
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating bus location' });
  }
});

// Get estimated arrival time
router.get('/:busId/eta/:stopId', async (req, res) => {
  try {
    const { busId, stopId } = req.params;
    const busRef = db.ref(`buses/${busId}`);
    const stopRef = db.ref(`stops/${stopId}`);
    
    const [busSnapshot, stopSnapshot] = await Promise.all([
      busRef.once('value'),
      stopRef.once('value')
    ]);
    
    const bus = busSnapshot.val();
    const stop = stopSnapshot.val();
    
    if (!bus || !stop) {
      return res.status(404).json({ error: 'Bus or stop not found' });
    }
    
    // Simple ETA calculation (can be enhanced with real traffic data)
    const speed = bus.location.speed || 30; // km/h
    const distance = calculateDistance(
      bus.location.latitude,
      bus.location.longitude,
      stop.latitude,
      stop.longitude
    );
    
    const eta = Math.round((distance / speed) * 60); // minutes
    
    res.json({ eta });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating ETA' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

module.exports = router;
