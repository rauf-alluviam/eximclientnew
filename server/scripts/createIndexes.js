import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.DEV_MONGODB_URI ;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

async function createOptimizedIndexes() {
  try {
    // Connect to database first
    await connectDB();
    
    console.log('Starting index creation...');
    
    // Get the collection directly
    const db = mongoose.connection.db;
    const collection = db.collection('jobs');
    
    // Drop existing indexes that might conflict (except _id and unique indexes)
    try {
      const existingIndexes = await collection.listIndexes().toArray();
      console.log('Existing indexes:', existingIndexes.map(idx => idx.name));
      
      // Don't drop unique indexes or _id index
      const indexesToDrop = existingIndexes.filter(idx => 
        !idx.unique && 
        idx.name !== '_id_' && 
        !idx.name.includes('job_no_1_year_1') &&
        !idx.name.includes('importerURL')
      );
      
      for (const index of indexesToDrop) {
        if (index.name !== '_id_') {
          try {
            await collection.dropIndex(index.name);
            console.log(`Dropped index: ${index.name}`);
          } catch (err) {
            console.log(`Could not drop index ${index.name}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.log('Error managing existing indexes:', err.message);
    }

    // Create optimized indexes
    const indexes = [
      // Primary filtering indexes
      { year: 1, ie_code_no: 1 },
      { year: 1, status: 1, ie_code_no: 1 },
      { year: 1, status: 1, importer: 1 },
      { year: 1, status: 1, detailed_status: 1 },
      { year: 1, ie_code_no: 1, status: 1, detailed_status: 1 },
      
      // Secondary filtering indexes
      { supplier_exporter: 1, year: 1 },
      { be_no: 1, year: 1 },
      { job_no: 1, year: 1, ie_code_no: 1 },
      
      // Date field indexes for sorting (sparse to save space)
      { vessel_berthing: 1 },
      { gateway_igm_date: 1 },
      { discharge_date: 1 },
      { be_date: 1 },
      { rail_out_date: 1 },
      { emptyContainerOffLoadDate: 1 },
      
      // Container detention dates
      { 'container_nos.detention_from': 1 },
      
      // Text search compound index
      { 
        job_no: 1, 
        supplier_exporter: 1, 
        importer: 1, 
        year: 1 
      }
    ];

    console.log('Creating new optimized indexes...');
    
    for (let i = 0; i < indexes.length; i++) {
      const indexSpec = indexes[i];
      try {
        const indexName = Object.keys(indexSpec).join('_') + '_' + Object.values(indexSpec).join('_');
        
        // Create sparse indexes for date fields
        const isDateField = Object.keys(indexSpec).some(key => 
          ['vessel_berthing', 'gateway_igm_date', 'discharge_date', 'be_date', 'rail_out_date', 'emptyContainerOffLoadDate', 'container_nos.detention_from'].includes(key)
        );
        
        const options = isDateField ? { sparse: true, background: true } : { background: true };
        
        const result = await collection.createIndex(indexSpec, options);
        console.log(`✅ Created index ${i + 1}/${indexes.length}: ${result}`);
      } catch (err) {
        console.log(`❌ Failed to create index:`, indexSpec, err.message);
      }
    }

    // Create text search index separately
    try {
      const textIndexResult = await collection.createIndex(
        { 
          job_no: "text", 
          supplier_exporter: "text", 
          importer: "text", 
          awb_bl_no: "text",
          be_no: "text",
          custom_house: "text"
        },
        { 
          background: true,
          name: "job_text_search_idx",
          weights: {
            job_no: 10,
            supplier_exporter: 5,
            importer: 5,
            be_no: 8,
            awb_bl_no: 6,
            custom_house: 3
          }
        }
      );
      console.log('✅ Created text search index:', textIndexResult);
    } catch (err) {
      console.log('❌ Failed to create text search index:', err.message);
    }

    // Show final index list
    const finalIndexes = await collection.listIndexes().toArray();
    console.log('\n📊 Final indexes:');
    finalIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 Index creation completed successfully!');
    
    // Get collection stats
    try {
      const stats = await db.collection('jobs').stats();
      console.log(`\n📈 Collection stats:`);
      console.log(`- Document count: ${stats.count}`);
      console.log(`- Total index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`- Average document size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
    } catch (err) {
      console.log('Could not get collection stats:', err.message);
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
createOptimizedIndexes();
