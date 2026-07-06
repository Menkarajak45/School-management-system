const router = require('express').Router();
const Class = require('../models/Class');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const classes = await Class.find().sort({ createdAt: -1 });
  res.json(classes);
});

router.post('/', auth, async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: 'Class deleted' });
});

module.exports = router;
