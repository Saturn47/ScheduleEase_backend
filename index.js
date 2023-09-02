const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // For sending OTP via email
const randomstring = require('randomstring'); // For generating random OTP
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
  email: String,
  otp: String // Store OTP in user document
});

const User = mongoose.model('userdetails', userSchema);

// Function to send OTP via email (you can use a similar function for SMS)
async function sendOTPByEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., Gmail
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'OTP for Login',
    text: `Your OTP for login is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
}

// Handle OTP request
app.route('/request-otp')
  .post(async (req, res) => {
    try {
      const { email } = req.body;

      // Generate a random OTP
      const otp = randomstring.generate(6);

      // Store the OTP in the user's document
      const newUser = new User({ email, otp });
      await newUser.save();
      await sendOTPByEmail(email, otp);

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('OTP request error:', error);
      res.status(500).json({ error: 'An error occurred while requesting OTP' });
    }
  });

// Handle OTP-based login
app.route('/login')
  .post(async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email, otp });

      if (user) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'An error occurred during login' });
    }
  });

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

