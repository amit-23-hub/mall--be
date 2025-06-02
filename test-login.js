const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Get User model
const User = require('./models/User');

// Test login with superadmin credentials
async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'superadmin',
      password: 'superadmin123'
    });
    
    console.log('Login Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Check users in the database
async function checkUsers() {
  try {
    // Find all users
    const users = await User.find().select('+password');
    console.log('Users in database:', users.map(u => ({
      _id: u._id,
      username: u.username,
      role: u.role,
      password: u.password.substring(0, 10) + '...' // Only show part of the hashed password
    })));
    
    // Check if superadmin exists
    const superadmin = await User.findOne({ username: 'superadmin' }).select('+password');
    if (superadmin) {
      console.log('Superadmin found:', {
        _id: superadmin._id,
        username: superadmin.username,
        role: superadmin.role
      });
      
      // Test password match
      const testPassword = 'superadmin123';
      const isMatch = await bcrypt.compare(testPassword, superadmin.password);
      console.log(`Password match for 'superadmin123': ${isMatch}`);
    } else {
      console.log('Superadmin not found in database');
    }
    
    return users;
  } catch (error) {
    console.error('Error checking users:', error);
    return null;
  }
}

// Reset all user passwords
async function resetAllPasswords() {
  try {
    // Define user credentials
    const userCredentials = [
      { username: 'superadmin', password: 'superadmin123' },
      { username: 'admin1', password: 'admin123' },
      { username: 'manager1', password: 'manager123' },
      { username: 'staff1', password: 'staff123' },
      { username: 'tenant1', password: 'tenant123' }
    ];
    
    // Update each user's password
    for (const cred of userCredentials) {
      const user = await User.findOne({ username: cred.username });
      
      if (user) {
        // Generate new password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(cred.password, salt);
        
        // Update user password directly in the database to bypass any middleware
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`Password reset for ${cred.username}`);
      } else {
        console.log(`User ${cred.username} not found`);
      }
    }
    
    console.log('All passwords have been reset');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  }
}

async function runTests() {
  console.log('===== CHECKING CURRENT USERS =====');
  await checkUsers();
  
  console.log('\n===== RESETTING ALL PASSWORDS =====');
  await resetAllPasswords();
  
  console.log('\n===== CHECKING USERS AFTER RESET =====');
  await checkUsers();
  
  console.log('\n===== TESTING LOGIN WITH SUPERADMIN =====');
  await testLogin();
  
  // Disconnect from MongoDB
  mongoose.disconnect();
}

runTests();
