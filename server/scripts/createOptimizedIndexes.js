import mongoose from "mongoose";
import JobModel from "../models/jobModel.js";

// Connect to MongoDB if not already connected
const connectToMongoDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/exim');
    console.log('MongoDB connected for index creation');
  }
};

// Create optimized indexes for job queries
const createOptimizedIndexes = async () => {
  try {
    await connectToMongoDB();
    console.log('Starting index creation...');

    // Compound index for IE code + year + status queries
    await JobModel.collection.createIndex(
      { 
        ie_code_no: 1, 
        year: 1, 
        status: 1 
      },
      { 
        name: "ie_code_year_status_idx",
        background: true 
      }
    );
    console.log('✅ Created ie_code_year_status_idx');

    // Compound index for IE code + year + be_no (for filtering cancelled jobs)
    await JobModel.collection.createIndex(
      { 
        ie_code_no: 1, 
        year: 1, 
        be_no: 1 
      },
      { 
        name: "ie_code_year_be_no_idx",
        background: true 
      }
    );
    console.log('✅ Created ie_code_year_be_no_idx');

    // Text index for search functionality
    await JobModel.collection.createIndex(
      {
        job_no: "text",
        supplier_exporter: "text",
        importer: "text",
        custom_house: "text",
        awb_bl_no: "text",
        origin_country: "text",
        description: "text"
      },
      {
        name: "search_text_idx",
        background: true,
        weights: {
          job_no: 10,
          supplier_exporter: 8,
          importer: 6,
          custom_house: 4,
          awb_bl_no: 4,
          origin_country: 2,
          description: 1
        }
      }
    );
    console.log('✅ Created search_text_idx');

    // Single field indexes for sorting and filtering
    await JobModel.collection.createIndex(
      { vessel_berthing: 1 },
      { name: "vessel_berthing_idx", background: true }
    );
    console.log('✅ Created vessel_berthing_idx');

    await JobModel.collection.createIndex(
      { gateway_igm_date: 1 },
      { name: "gateway_igm_date_idx", background: true }
    );
    console.log('✅ Created gateway_igm_date_idx');

    await JobModel.collection.createIndex(
      { discharge_date: 1 },
      { name: "discharge_date_idx", background: true }
    );
    console.log('✅ Created discharge_date_idx');

    await JobModel.collection.createIndex(
      { be_date: 1 },
      { name: "be_date_idx", background: true }
    );
    console.log('✅ Created be_date_idx');

    console.log('✅ All optimized indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
};

// Export the function
export { createOptimizedIndexes };

// Run immediately if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createOptimizedIndexes().then(() => {
    console.log('Index creation completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Index creation failed:', error);
    process.exit(1);
  });
}
