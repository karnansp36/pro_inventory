const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
  try {
    await User.deleteMany(); // Clear existing users

    const salt = await bcrypt.genSalt(10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Admin',
    });

    const brandOwnerUser = await User.create({
      name: 'Brand Owner User',
      email: 'brandowner@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BrandOwner',
    });

    const managerUser = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Manager',
      assignedManager: brandOwnerUser._id,
    });

    const branchOwnerUser = await User.create({
      name: 'Branch Owner User',
      email: 'branchowner@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BranchOwner',
      assignedManager: managerUser._id,
    });

    // Assign branch owner to brand owner
    brandOwnerUser.assignedBranchOwners.push(branchOwnerUser._id);
    await brandOwnerUser.save();

    console.log('Users seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error seeding users: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();