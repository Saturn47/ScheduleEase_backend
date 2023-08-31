const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: String,
  title: String,
  start: String,
  end: String,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;