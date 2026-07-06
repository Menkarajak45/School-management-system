const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  phone: { type: String },
  photo: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
