const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.database();

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedulesRef = db.ref('schedules');
    const snapshot = await schedulesRef.once('value');
    const schedules = snapshot.val();
    res.json(schedules || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching schedules' });
  }
});

// Get schedule by route
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const scheduleRef = db.ref(`schedules/${routeId}`);
    const snapshot = await scheduleRef.once('value');
    const schedule = snapshot.val();
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching schedule' });
  }
});

// Update schedule (admin only)
router.put('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { stops, weekdaySchedule, weekendSchedule } = req.body;
    
    const scheduleRef = db.ref(`schedules/${routeId}`);
    await scheduleRef.set({
      stops,
      weekdaySchedule,
      weekendSchedule,
      lastUpdate: admin.database.ServerValue.TIMESTAMP
    });
    
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating schedule' });
  }
});

// Get schedule for specific stop
router.get('/stop/:stopId', async (req, res) => {
  try {
    const { stopId } = req.params;
    const schedulesRef = db.ref('schedules');
    const snapshot = await schedulesRef.once('value');
    const schedules = snapshot.val();
    
    const stopSchedules = [];
    
    // Find all routes that include this stop
    Object.entries(schedules || {}).forEach(([routeId, schedule]) => {
      if (schedule.stops.includes(stopId)) {
        stopSchedules.push({
          routeId,
          weekdaySchedule: schedule.weekdaySchedule,
          weekendSchedule: schedule.weekendSchedule
        });
      }
    });
    
    if (stopSchedules.length === 0) {
      return res.status(404).json({ error: 'No schedules found for this stop' });
    }
    
    res.json(stopSchedules);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stop schedules' });
  }
});

module.exports = router;
