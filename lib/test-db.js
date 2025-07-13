require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    console.log('MongoDB URL:', mongoUrl);
    
    if (!mongoUrl) {
      console.error('MONGODB_URL environment variable is not set!');
      return;
    }
    
    await mongoose.connect(mongoUrl);
    console.log('Database connected successfully!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    const testDoc = new Test({ test: 'connection test' });
    await testDoc.save();
    console.log('Test document created successfully!');
    
    await mongoose.disconnect();
    console.log('Database disconnected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

testConnection(); 