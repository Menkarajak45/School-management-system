const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  section: { type: String, required: true },
  teacher: { type: String, required: true },
  capacity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
