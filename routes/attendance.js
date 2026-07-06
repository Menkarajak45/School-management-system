const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

// Monthly stats for dashboard chart  ← must be BEFORE /:param routes
router.get('/monthly-stats', auth, async (req, res) => {
  const records = await Attendance.find();
  const map = {};
  records.forEach(r => {
    const month = r.date.slice(0, 7);
    if (!map[month]) map[month] = { month, Present: 0, Absent: 0, Late: 0 };
    map[month][r.status]++;
  });
  res.json(Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6));
});

// Get attendance by date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  const filter = date ? { date } : {};
  const records = await Attendance.find(filter).populate('student', 'name rollNumber class');
  res.json(records);
});

// Mark / update attendance for a date (bulk)
router.post('/mark', auth, async (req, res) => {
  try {
    const { date, records } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter: { student: r.studentId, date },
        update: { $set: { status: r.status } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: 'Attendance saved' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get attendance summary for a student  ← param route LAST
router.get('/summary/:studentId', auth, async (req, res) => {
  const records = await Attendance.find({ student: req.params.studentId });
  const total   = records.length;
  const present = records.filter(r => r.status === 'Present').length;
  const absent  = records.filter(r => r.status === 'Absent').length;
  const late    = records.filter(r => r.status === 'Late').length;
  res.json({ total, present, absent, late });
});

module.exports = router;
