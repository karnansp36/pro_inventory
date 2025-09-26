import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Sales from './models/Sales.js';
import Expense from './models/Expense.js';
import StockRequest from './models/StockRequest.js';
import Transport from './models/Transport.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const generateSampleData = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Sales.deleteMany();
    await Expense.deleteMany();
    await StockRequest.deleteMany();
    await Transport.deleteMany();
    console.log('Existing data cleared.');

    const salt = await bcrypt.genSalt(10);

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Admin',
    });
    console.log('Admin User created.');

    // 2. Create Brand Owners
    const brandOwner1 = await User.create({
      name: 'Brand Owner Alpha',
      email: 'brandowner1@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BrandOwner',
    });
    const brandOwner2 = await User.create({
      name: 'Brand Owner Beta',
      email: 'brandowner2@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BrandOwner',
    });
    console.log('Brand Owners created.');

    // 3. Create Managers and assign to Brand Owners
    const manager1 = await User.create({
      name: 'Manager One',
      email: 'manager1@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Manager',
      assignedManager: brandOwner1._id,
    });
    const manager2 = await User.create({
      name: 'Manager Two',
      email: 'manager2@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Manager',
      assignedManager: brandOwner1._id,
    });
    const manager3 = await User.create({
      name: 'Manager Three',
      email: 'manager3@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'Manager',
      assignedManager: brandOwner2._id,
    });
    console.log('Managers created and assigned.');

    // 4. Create Branch Owners and assign to Managers
    const branchOwnerA = await User.create({
      name: 'Branch Owner A',
      email: 'branchownerA@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BranchOwner',
      assignedManager: manager1._id,
    });
    const branchOwnerB = await User.create({
      name: 'Branch Owner B',
      email: 'branchownerB@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BranchOwner',
      assignedManager: manager1._id,
    });
    const branchOwnerC = await User.create({
      name: 'Branch Owner C',
      email: 'branchownerC@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BranchOwner',
      assignedManager: manager2._id,
    });
    const branchOwnerD = await User.create({
      name: 'Branch Owner D',
      email: 'branchownerD@example.com',
      password: await bcrypt.hash('password123', salt),
      role: 'BranchOwner',
      assignedManager: manager3._id,
    });
    console.log('Branch Owners created and assigned.');

    // Update Brand Owners with assigned Managers
    brandOwner1.assignedBranchOwners.push(manager1._id, manager2._id); // In this schema, BrandOwner assigns Managers, not BranchOwners directly
    await brandOwner1.save();
    brandOwner2.assignedBranchOwners.push(manager3._id);
    await brandOwner2.save();
    console.log('Brand Owners updated with assigned Managers.');

    // Update Managers with assigned Branch Owners (this field is not in User model, but conceptually they manage them)
    // For the purpose of the hierarchy, the assignedManager field on the BranchOwner points to the Manager.

    // 5. Create Sample Sales for Branch Owners
    const sales1 = await Sales.create({
      branchOwner: branchOwnerA._id,
      cash: 100,
      gpay: 50,
      creditCard: 20,
      total: 170,
      date: new Date(),
    });
    const sales2 = await Sales.create({
      branchOwner: branchOwnerA._id,
      cash: 80,
      gpay: 30,
      creditCard: 10,
      total: 120,
      date: new Date(Date.now() - 86400000), // yesterday
    });
    const sales3 = await Sales.create({
      branchOwner: branchOwnerB._id,
      cash: 200,
      gpay: 0,
      creditCard: 75,
      total: 275,
      date: new Date(),
    });
    console.log('Sample Sales created.');

    // 6. Create Sample Expenses for Branch Owners
    const expense1 = await Expense.create({
      branchOwner: branchOwnerA._id,
      category: 'Rent',
      amount: 500,
      description: 'Monthly shop rent',
      date: new Date(),
    });
    const expense2 = await Expense.create({
      branchOwner: branchOwnerA._id,
      category: 'Utilities',
      amount: 150,
      description: 'Electricity bill',
      date: new Date(Date.now() - 86400000 * 2), // two days ago
    });
    const expense3 = await Expense.create({
      branchOwner: branchOwnerB._id,
      category: 'Salaries',
      amount: 1200,
      description: 'Staff salaries',
      date: new Date(),
    });
    console.log('Sample Expenses created.');

    // 7. Create Sample Stock Requests for Branch Owners
    const stockRequest1 = await StockRequest.create({
      branchOwner: branchOwnerA._id,
      productName: 'Product X',
      quantity: 10,
      priority: 'High',
      status: 'Pending',
    });
    const stockRequest2 = await StockRequest.create({
      branchOwner: branchOwnerB._id,
      productName: 'Product Y',
      quantity: 5,
      priority: 'Medium',
      status: 'Approved',
    });
    console.log('Sample Stock Requests created.');

    // 8. Create Sample Transport for Stock Requests (BrandOwner creates this)
    const transport1 = await Transport.create({
      stockRequest: stockRequest1._id,
      bundleSize: 2,
      quantity: 10,
      from: 'Warehouse A',
      to: 'Branch A',
      status: 'In Transit',
    });
    const transport2 = await Transport.create({
      stockRequest: stockRequest2._id,
      bundleSize: 1,
      quantity: 5,
      from: 'Warehouse B',
      to: 'Branch B',
      status: 'Delivered',
      receivedQuantity: 5,
    });
    console.log('Sample Transport created.');

    console.log('✅ All Sample Data Generated Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error Generating Sample Data:', error.message);
    process.exit(1);
  }
};

generateSampleData();