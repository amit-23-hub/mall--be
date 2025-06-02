require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetSuperadminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = require('./models/User');

    // New password
    const newPassword = 'superadmin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update superadmin password
    const result = await User.updateOne(
      { username: 'superadmin' },
      { $set: { password: hashedPassword } }
    );

    if (result.nModified === 0) {
      console.log('Superadmin user not found or password already set');
    } else {
      console.log('Successfully updated superadmin password');
      console.log('Username: superadmin');
      console.log('New Password: superadmin123');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetSuperadminPassword();
