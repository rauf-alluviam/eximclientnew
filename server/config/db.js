// config/db.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Connect to the appropriate MongoDB database based on the current environment
 */
const connectDB = async () => {
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
    const conn = await mongoose.connect(mongoURI);

    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
