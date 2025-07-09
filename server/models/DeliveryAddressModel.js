import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
    // Track which companies/importers commonly use this address
    associated_ie_codes: [{ type: String, trim: true }],
    // Additional fields that might be useful
    landmark: { type: String, trim: true },
    contact_person: { type: String, trim: true },
    contact_number: { type: String, trim: true },
    // For quick full-text search
    search_text: { type: String, trim: true }
  },
  { timestamps: true }
);

// Create indexes for faster querying
deliveryAddressSchema.index({ postal_code: 1 });
deliveryAddressSchema.index({ associated_ie_codes: 1 });
deliveryAddressSchema.index({ search_text: "text" });

// Pre-save hook to generate search text
deliveryAddressSchema.pre("save", function(next) {
  // Create a searchable text field that combines all relevant address components
  this.search_text = [
    this.address,
    this.city,
    this.district,
    this.state,
    this.postal_code,
    this.landmark,
    this.contact_person
  ].filter(Boolean).join(" ");
  
  next();
});

// Static method to find addresses by postal code
deliveryAddressSchema.statics.findByPostalCode = function(postalCode) {
  return this.find({ postal_code: postalCode });
};

// Static method to find addresses by IE code
deliveryAddressSchema.statics.findByIECode = function(ieCode) {
  return this.find({ associated_ie_codes: ieCode });
};

// Static method for text search
deliveryAddressSchema.statics.searchAddresses = function(query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

const DeliveryAddressModel = mongoose.models.DeliveryAddress || 
  mongoose.model("DeliveryAddress", deliveryAddressSchema);

export default DeliveryAddressModel;