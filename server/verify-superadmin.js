import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import the SuperAdmin model
import SuperAdmin from "./models/superAdminModel.js";

const verifySuperAdmin = async () => {
  try {
    // Determine which MongoDB URI to use based on NODE_ENV
    const env = process.env.NODE_ENV || "development";
    let mongoURI;

    switch (env) {
      case "production":
        mongoURI = process.env.PROD_MONGODB_URI;
        break;
      case "server":
        mongoURI = process.env.SERVER_MONGODB_URI;
        break;
      case "development":
      default:
        mongoURI = process.env.DEV_MONGODB_URI;
        break;
    }

    if (!mongoURI) {
      throw new Error(`MongoDB URI not defined for environment: ${env}`);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB (${env} environment)`);

    // Find the SuperAdmin
    const superAdmin = await SuperAdmin.findOne({ username: "superadmin" });
    if (!superAdmin) {
      console.log("❌ No SuperAdmin found with username 'superadmin'");
      return;
    }

    console.log("✅ SuperAdmin found:");
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   IsActive: ${superAdmin.isActive}`);
    console.log(`   LoginAttempts: ${superAdmin.loginAttempts}`);
    console.log(`   Locked: ${superAdmin.isLocked()}`);
    console.log(`   Password Hash: ${superAdmin.password}`);

    // Test password comparison
    const testPassword = "Admin@123";
    console.log(`\n🔍 Testing password: "${testPassword}"`);
    
    // Test direct bcrypt comparison
    const directCompare = await bcrypt.compare(testPassword, superAdmin.password);
    console.log(`   Direct bcrypt compare: ${directCompare}`);
    
    // Test using model method
    const modelCompare = await superAdmin.comparePassword(testPassword);
    console.log(`   Model method compare: ${modelCompare}`);

    // Also test if the password might be stored as plain text
    console.log(`   Is password plain text? ${superAdmin.password === testPassword}`);
    
    // Test with a few common variations
    const variations = ["admin@123", "ADMIN@123", "Admin123", "admin123"];
    for (const variation of variations) {
      const varCompare = await superAdmin.comparePassword(variation);
      console.log(`   Testing "${variation}": ${varCompare}`);
    }
    
  } catch (error) {
    console.error("❌ Error verifying SuperAdmin:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
verifySuperAdmin();
