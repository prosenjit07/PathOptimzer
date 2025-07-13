require('dotenv').config();
const mongoose = require('mongoose');

// Import the Resume model
const resumeSchema = new mongoose.Schema({
  resumeId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  firstName: { type: String },
  lastName: { type: String },
  jobTitle: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  summary: { type: String },
  experience: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
  education: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  themeColor: { type: String, default: "#3B82F6" },
});

const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

async function testResumeCreation() {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    console.log('Testing resume creation with MongoDB URL:', mongoUrl);
    
    if (!mongoUrl) {
      console.error('MONGODB_URL environment variable is not set!');
      return;
    }
    
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    };
    
    await mongoose.connect(mongoUrl, connectionOptions);
    console.log('Database connected successfully!');
    
    // Test creating a resume
    const testResume = new Resume({
      resumeId: 'test-resume-' + Date.now(),
      userId: 'test-user-123',
      title: 'Test Resume',
    });
    
    const savedResume = await testResume.save();
    console.log('Test resume created successfully:', savedResume.resumeId);
    
    // Clean up - delete the test resume
    await Resume.findByIdAndDelete(savedResume._id);
    console.log('Test resume cleaned up');
    
    await mongoose.disconnect();
    console.log('Database disconnected successfully!');
    console.log('✅ Resume creation test passed!');
  } catch (error) {
    console.error('❌ Resume creation test failed:', error.message);
    console.error('Full error:', error);
  }
}

testResumeCreation(); 