import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import the SuperAdmin model
import SuperAdmin from "./models/superAdminModel.js";

const resetSuperAdmin = async () => {
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

    // Delete existing SuperAdmin
    await SuperAdmin.deleteMany({});
    console.log("🗑️  Removed existing SuperAdmin records");

    // Create new SuperAdmin with plain password (will be hashed by pre-save hook)
    const defaultUsername = "superadmin";
    const defaultPassword = "1qazXsw@"; // Plain password - let the model hash it
    const defaultEmail = "superadmin@exim.com";

    const superAdmin = new SuperAdmin({
      username: defaultUsername,
      password: defaultPassword, // Plain password - will be hashed by pre-save hook
      email: defaultEmail,
      isActive: true,
      role: "superadmin",
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    await superAdmin.save();

    console.log("✅ SuperAdmin created successfully!");
    console.log("📋 Login Credentials:");
    console.log(`   Username: ${defaultUsername}`);
    console.log(`   Password: ${defaultPassword}`);
    
    // Verify the password works
    console.log("\n🔍 Verifying password...");
    const savedAdmin = await SuperAdmin.findOne({ username: defaultUsername });
    const passwordTest = await savedAdmin.comparePassword(defaultPassword);
    console.log(`   Password verification: ${passwordTest ? '✅ SUCCESS' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error("❌ Error creating SuperAdmin:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
resetSuperAdmin();
