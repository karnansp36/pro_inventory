import mongoose from 'mongoose';
import dotenv from 'dotenv';
import generateSampleData from './sampleData.js';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await generateSampleData();
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}