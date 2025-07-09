import DeliveryAddressModel from "../models/DeliveryAddressModel.js";
import JobModel from "../models/jobModel.js";
import axios from "axios";

// Get all delivery addresses
export const getAllDeliveryAddresses = async (req, res) => {
  try {
    const addresses = await DeliveryAddressModel.find().sort({ createdAt: -1 });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery addresses by IE code (for address suggestions)
export const getDeliveryAddressesByIECode = async (req, res) => {
  try {
    const { ieCode } = req.params;
    const addresses = await DeliveryAddressModel.findByIECode(ieCode);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search delivery addresses
// Search delivery addresses with improved partial matching
export const searchDeliveryAddresses = async (req, res) => {
  try {
    const { query } = req.params;

    // Split search query into words and filter out empty strings
    const searchWords = query
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Create regex patterns that match words anywhere in the text
    const searchPatterns = searchWords.map((word) => new RegExp(word, "i"));

    const addresses = await DeliveryAddressModel.find({
      $and: searchPatterns.map((pattern) => ({
        $or: [
          { address: pattern },
          { city: pattern },
          { district: pattern },
          { state: pattern },
          { postal_code: pattern },
        ],
      })),
    }).limit(10);

    // Enhanced sorting to prioritize matches in address field
    const sortedAddresses = addresses.sort((a, b) => {
      const allFieldsA =
        `${a.address} ${a.city} ${a.district} ${a.state} ${a.postal_code}`.toLowerCase();
      const allFieldsB =
        `${b.address} ${b.city} ${b.district} ${b.state} ${b.postal_code}`.toLowerCase();

      // Check exact matches first
      const aExactMatch = allFieldsA.includes(query.toLowerCase());
      const bExactMatch = allFieldsB.includes(query.toLowerCase());

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Then check word position (earlier = higher priority)
      const aIndex = allFieldsA.indexOf(query.toLowerCase());
      const bIndex = allFieldsB.indexOf(query.toLowerCase());

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      return 0;
    });

    res.status(200).json(sortedAddresses);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// Get delivery addresses by postal code
export const getDeliveryAddressesByPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.params;
    const addresses = await DeliveryAddressModel.findByPostalCode(postalCode);
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch address details from OpenStreetMap based on postal code
export const fetchAddressFromPostalCode = async (req, res) => {
  try {
    const { postalCode } = req.params;
    const country = req.query.country || "India";

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=${country}&format=json`
    );

    if (response.data && response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res
        .status(404)
        .json({ message: "No address found for this postal code" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new delivery address
export const createDeliveryAddress = async (req, res) => {
  try {
    const {
      address,
      postal_code,
      city,
      district,
      state,
      country,
      ieCode,
      ...rest
    } = req.body;

    // Check if a similar address already exists
    const existingAddress = await DeliveryAddressModel.findOne({
      postal_code,
      city,
      address: { $regex: new RegExp(address.substring(0, 20), "i") },
    });

    if (existingAddress) {
      // If IE code is not already associated, add it
      if (ieCode && !existingAddress.associated_ie_codes.includes(ieCode)) {
        existingAddress.associated_ie_codes.push(ieCode);
        await existingAddress.save();
      }
      return res.status(200).json({
        message: "Address already exists",
        address: existingAddress,
      });
    }

    // Create new address
    const newAddress = new DeliveryAddressModel({
      address,
      postal_code,
      city,
      district,
      state,
      country: country || "India",
      associated_ie_codes: ieCode ? [ieCode] : [],
      ...rest,
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update container in job to use delivery address ID
export const updateJobContainerDeliveryAddress = async (req, res) => {
  try {
    const { jobId, containerId, addressId } = req.params;

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find the specific container
    const containerIndex = job.container_nos.findIndex(
      (container) => container._id.toString() === containerId
    );

    if (containerIndex === -1) {
      return res
        .status(404)
        .json({ message: "Container not found in this job" });
    }

    // Get the address to store formatted address for backward compatibility
    const address = await DeliveryAddressModel.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Delivery address not found" });
    }

    // Format address for backward compatibility
    const formattedAddress = `${address.address}, ${address.city}, ${address.district}, ${address.state}, ${address.postal_code}, ${address.country}`;

    // Update container with new address ID and formatted address string
    job.container_nos[containerIndex].delivery_address_id = addressId;
    job.container_nos[containerIndex].delivery_address = formattedAddress;

    await job.save();

    res.status(200).json({
      message: "Container delivery address updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllDeliveryAddresses,
  getDeliveryAddressesByIECode,
  searchDeliveryAddresses,
  getDeliveryAddressesByPostalCode,
  fetchAddressFromPostalCode,
  createDeliveryAddress,
  updateJobContainerDeliveryAddress,
};
