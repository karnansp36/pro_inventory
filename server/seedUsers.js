const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // adjust path if needed

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear old users
    await User.deleteMany();

    // Create sample users
    const users = [
      {
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'Admin@123', // will be hashed by pre('save')
        role: 'Admin',
      },
      {
        name: 'Brand Owner 1',
        email: 'brandowner@example.com',
        password: 'Brand@123',
        role: 'BrandOwner',
      },
      {
        name: 'Manager 1',
        email: 'manager@example.com',
        password: 'Manager@123',
        role: 'Manager',
      },
      {
        name: 'Branch Owner 1',
        email: 'branchowner@example.com',
        password: 'Branch@123',
        role: 'BranchOwner',
      },
    ];

    await User.insertMany(users);

    console.log('✅ Users Seeded Successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error Seeding Users:', error.message);
    process.exit(1);
  }
};

seedUsers();
