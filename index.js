const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Appointment = require('./appointments');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const mongo_url = process.env.DATABASE;
mongoose.connect(mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to MongoDB");
})
.catch(error => {
  console.error('MongoDB connection error:', error);
});

// Define User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Handle user registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Handle user login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Endpoint to book an appointment
app.post('/book-appointment', async (req, res) => {
  try {
    const { event } = req.body;

    // Save the event in the MongoDB collection
    const newAppointment = new Appointment(event);
    await newAppointment.save();

    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'An error occurred while booking appointment' });
  }
});


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
