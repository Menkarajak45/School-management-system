const router = require('express').Router();
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const teachers = await Teacher.find().sort({ createdAt: -1 });
  res.json(teachers);
});

router.post('/', auth, async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Teacher.findByIdAndDelete(req.params.id);
  res.json({ message: 'Teacher deleted' });
});

module.exports = router;
