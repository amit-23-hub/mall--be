const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Role = require('./models/Role');
const Rule = require('./models/Rule');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mall-management');

// Read JSON files
const mockData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/mockData.json'), 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Role.deleteMany();
    await Rule.deleteMany();

    console.log('Data cleared...'.cyan);

    // Import roles - map to MongoDB schema
    const rolesToInsert = mockData.roles.map(role => ({
      name: role.name,
      description: role.description
    }));
    
    const roleDocuments = await Role.insertMany(rolesToInsert);
    console.log(`${roleDocuments.length} roles imported`.green);

    // Create a mapping from original ID to MongoDB _id
    const roleIdMap = {};
    mockData.roles.forEach((originalRole, index) => {
      roleIdMap[originalRole.id] = roleDocuments[index]._id;
    });

    // Hash passwords for users and map to MongoDB schema
    const usersToInsert = await Promise.all(mockData.users.map(async user => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      return {
        username: user.username,
        password: hashedPassword,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }));

    // Import users
    const userDocuments = await User.create(usersToInsert);
    console.log(`${userDocuments.length} users imported`.green);

    // Import rules - map to MongoDB schema and use the role ID mapping
    const rulesToInsert = mockData.rules.map(rule => {
      // Get the MongoDB _id for this role
      const roleId = roleIdMap[rule.roleId];
      
      return {
        roleId: roleId,
        title: rule.title,
        description: rule.description,
        content: rule.content,
        videoUrl: rule.videoUrl
      };
    });

    await Rule.insertMany(rulesToInsert);
    console.log(`${rulesToInsert.length} rules imported`.green);

    console.log('Data imported successfully!'.green.bold);
    process.exit();
  } catch (err) {
    console.error(err.red);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Role.deleteMany();
    await Rule.deleteMany();

    console.log('Data destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete data');
  process.exit();
}
