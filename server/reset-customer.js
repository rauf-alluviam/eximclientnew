import mongoose from 'mongoose';
import CustomerModel from './models/customerModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://exim_test:5pzZt0QlPJoj4iA6@eximtest.xovvhdm.mongodb.net/exim");
    console.log('MongoDB Connected for reset testing');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const resetCustomerPassword = async () => {
  await connectDB();
  
  // Find the customer we've been testing with
  const customer = await CustomerModel.findOne({ ie_code_no: '812023773' });
  
  if (customer) {
    console.log('=== RESETTING CUSTOMER TO DEFAULT STATE ===');
    console.log('IE Code:', customer.ie_code_no);
    
    // Reset to generated password
    const generatedPassword = customer.generatePassword();
    console.log('Generated Password:', generatedPassword);
    
    customer.password = generatedPassword; // This will be hashed by pre-save hook
    customer.initialPassword = generatedPassword;
    customer.password_changed = false; // Reset to default state
    
    const savedCustomer = await customer.save();
    
    console.log('=== RESET COMPLETE ===');
    console.log('Password Hash:', savedCustomer.password.substring(0, 20) + '...');
    console.log('Initial Password:', savedCustomer.initialPassword);
    console.log('Password Changed:', savedCustomer.password_changed);
    
    // Verify it works
    const isPasswordCorrect = await savedCustomer.comparePassword(generatedPassword);
    console.log('Generated password verification:', isPasswordCorrect);
    
  } else {
    console.log('Customer not found');
  }
  
  mongoose.connection.close();
};

resetCustomerPassword().catch(console.error);
