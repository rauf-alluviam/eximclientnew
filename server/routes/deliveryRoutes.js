import express from "express";
import {
  getAllDeliveryAddresses,
  getDeliveryAddressesByIECode,
  searchDeliveryAddresses,
  getDeliveryAddressesByPostalCode,
  fetchAddressFromPostalCode,
  createDeliveryAddress,
  updateJobContainerDeliveryAddress,
} from "../controllers/DeliveryAddressController.js";

const router = express.Router();

// Get all delivery addresses
router.get("/api/getall", getAllDeliveryAddresses);

// Get delivery addresses by IE code (for address suggestions)
router.get("/api/ie-code/:ieCode", getDeliveryAddressesByIECode);

// Search delivery addresses
router.get("/api/search/:query", searchDeliveryAddresses);

// Get delivery addresses by postal code
router.get("/api/postal-code/:postalCode", getDeliveryAddressesByPostalCode);

// Fetch address from OpenStreetMap based on postal code
router.get("/api/lookup/:postalCode", fetchAddressFromPostalCode);

// Create new delivery address
router.post("/api/delivery-address", createDeliveryAddress);

// Update job container to use delivery address
router.patch(
  "/api/job/:jobId/container/:containerId/address/:addressId",
  updateJobContainerDeliveryAddress
);

export default router;
