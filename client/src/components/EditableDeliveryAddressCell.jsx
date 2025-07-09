import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  TextField,
  IconButton,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PlaceIcon from "@mui/icons-material/Place";
import axios from "axios";
import { debounce } from "lodash";

/**
 * EditableDeliveryAddressCell - Enhanced component for displaying and editing delivery addresses
 *
 * This component allows users to view and edit delivery addresses for jobs with an improved UI,
 * featuring address search and a modern dialog experience with validation feedback.
 */
const EditableDeliveryAddressCell = ({ cell, isCentered = false }) => {
  const { container_nos = [] } = cell.row.original;
  const { _id: jobId } = cell.row.original;
  const { ie_code_no } = cell.row.original;

  // Refs to prevent duplicate API calls
  const lastLoadedIECodeRef = useRef(null);
  const isLoadingIECodeRef = useRef(false);

  // Get container info
  const container = container_nos.length > 0 ? container_nos[0] : {};
  const containerId = container._id;

  // Get delivery address info
  const delivery_address = container.delivery_address || "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupSuccess, setLookupSuccess] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // State for form fields
  const [addressForm, setAddressForm] = useState({
    address: "",
    postal_code: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    landmark: "",
  });

  // Optimized function to load address suggestions by IE code (prevent duplicate API calls)
  const loadAddressSuggestionsByIECode = useCallback(async (ieCode) => {
    // Prevent duplicate calls for the same IE code
    if (lastLoadedIECodeRef.current === ieCode || isLoadingIECodeRef.current) {
      return;
    }

    try {
      isLoadingIECodeRef.current = true;
      lastLoadedIECodeRef.current = ieCode;
      setLookupLoading(true);

      const res = await axios.get(
        `${process.env.REACT_APP_API_STRING}/ie-code/${ieCode}`
      );

      if (res.data && res.data.length > 0) {
        setAddressSuggestions(res.data);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Error loading address suggestions:", error);
      setAddressSuggestions([]);
      // Reset the ref on error so user can retry
      lastLoadedIECodeRef.current = null;
    } finally {
      setLookupLoading(false);
      isLoadingIECodeRef.current = false;
    }
  }, []);

  // Parse existing address to pre-fill form when editing
  useEffect(() => {
    if (dialogOpen && delivery_address) {
      parseExistingAddress(delivery_address);
    }
  }, [dialogOpen, delivery_address]);

  // Load address suggestions when component mounts or IE code changes (optimized)
  useEffect(() => {
    if (ie_code_no && ie_code_no !== lastLoadedIECodeRef.current) {
      loadAddressSuggestionsByIECode(ie_code_no);
    }
  }, [ie_code_no, loadAddressSuggestionsByIECode]);

  // Parse existing address to form fields
  const parseExistingAddress = (fullAddress) => {
    if (!fullAddress) return;

    // Split by commas and clean up whitespace
    const parts = fullAddress.split(",").map((part) => part.trim());

    // Improved parsing logic to handle most formats
    const parsedAddress = {
      address: parts[0] || "",
      city: parts.length > 1 ? parts[1] : "",
      district: parts.length > 2 ? parts[2] : "",
      state: parts.length > 3 ? parts[3] : "",
      postal_code: parts.length > 4 ? parts[4] : "",
      country: parts.length > 5 ? parts[5] : "India",
      landmark: "",
    };

    // Try to identify postal code by looking for a 6-digit number
    for (let i = 0; i < parts.length; i++) {
      if (/^\d{6}$/.test(parts[i].trim())) {
        parsedAddress.postal_code = parts[i].trim();
        // Adjust other fields if necessary
        if (i < 4 && parts.length > 4) {
          parsedAddress.state = parts[i - 1] || "";
          parsedAddress.district = i > 1 ? parts[i - 2] || "" : "";
          parsedAddress.city = i > 2 ? parts[i - 3] || "" : parts[i - 1] || "";
        }
        break;
      }
    }

    setAddressForm(parsedAddress);
  };

  // Validate postal code (6 digits for India)
  const validatePostalCode = (postalCode) => {
    return /^\d{6}$/.test(postalCode);
  };

  // Fetch address details from postal code
  const fetchAddressByPostalCode = useCallback(async (postalCode) => {
    if (!validatePostalCode(postalCode)) {
      setErrors((prev) => ({
        ...prev,
        postal_code: "Postal Code must be exactly 6 digits.",
      }));
      return;
    } else {
      setErrors((prev) => ({
        ...prev,
        postal_code: "",
      }));
    }

    setLookupLoading(true);
    setLookupSuccess(false);

    try {
      // First check our database for existing addresses with this postal code
      const existingRes = await axios.get(
        `${process.env.REACT_APP_API_STRING}/postal-code/${postalCode}`
      );

      if (existingRes.data && existingRes.data.length > 0) {
        setAddressSuggestions(existingRes.data);

        // Auto-fill city, district, state from first result
        const firstAddress = existingRes.data[0];
        setAddressForm((prev) => ({
          ...prev,
          city: firstAddress.city || prev.city,
          district: firstAddress.district || prev.district,
          state: firstAddress.state || prev.state,
        }));

        setLookupSuccess(true);
      } else {
        // If not in our database, set no suggestions found
        setAddressSuggestions([]);
        // Don't show error immediately, let user continue typing
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setErrors((prev) => ({
        ...prev,
        postal_code: "Failed to lookup address details. Please enter manually.",
      }));
    }
    setLookupLoading(false);

    // Reset success indicator after 3 seconds
    if (lookupSuccess) {
      setTimeout(() => setLookupSuccess(false), 3000);
    }
  }, []);

  // Update form field
  const handleFieldChange = (field) => (event) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Reset lookup status when postal code changes
    if (field === "postal_code") {
      setLookupSuccess(false);
    }

    // If changing postal code, try to look up address details
    if (field === "postal_code" && event.target.value.length === 6) {
      fetchAddressByPostalCode(event.target.value);
    }
  };

  // Search for addresses with improved matching to align with backend
  const searchAddresses = debounce(async (query) => {
    if (!query || query.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    try {
      setLookupLoading(true);

      // Encode query to handle special characters
      const encodedQuery = encodeURIComponent(query);

      // Search by text using the backend's search endpoint
      const res = await axios.get(
        `${process.env.REACT_APP_API_STRING}/search/${encodedQuery}`
      );

      if (res.data && Array.isArray(res.data)) {
        // Add relevance scoring to match backend sorting
        const enhancedResults = res.data.map((address) => {
          const allFields =
            `${address.address} ${address.city} ${address.district} ${address.state} ${address.postal_code}`.toLowerCase();
          const queryLower = query.toLowerCase();

          // Split query into words to check for word-by-word matches
          const queryWords = queryLower
            .split(/\s+/)
            .filter((word) => word.length > 0);

          // Calculate relevance metrics
          const exactMatch = allFields.includes(queryLower);
          const positionIndex = allFields.indexOf(queryLower);

          // Word match count (how many words from the query match)
          const wordMatchCount = queryWords.filter((word) =>
            allFields.includes(word)
          ).length;

          // Add these metrics to the result object
          return {
            ...address,
            _relevance: {
              exactMatch,
              positionIndex: positionIndex !== -1 ? positionIndex : Infinity,
              wordMatchCount,
              // Specific field matches (prioritize address field)
              addressMatch: address.address.toLowerCase().includes(queryLower),
              postalCodeMatch: address.postal_code.includes(queryLower),
            },
          };
        });

        // Sort by relevance using multiple criteria (similar to backend)
        const sortedResults = enhancedResults.sort((a, b) => {
          // 1. Exact matches first
          if (a._relevance.exactMatch && !b._relevance.exactMatch) return -1;
          if (!a._relevance.exactMatch && b._relevance.exactMatch) return 1;

          // 2. Address field matches (prioritize)
          if (a._relevance.addressMatch && !b._relevance.addressMatch)
            return -1;
          if (!a._relevance.addressMatch && b._relevance.addressMatch) return 1;

          // 3. Postal code exact matches
          if (a._relevance.postalCodeMatch && !b._relevance.postalCodeMatch)
            return -1;
          if (!a._relevance.postalCodeMatch && b._relevance.postalCodeMatch)
            return 1;

          // 4. Word match count
          if (a._relevance.wordMatchCount !== b._relevance.wordMatchCount) {
            return b._relevance.wordMatchCount - a._relevance.wordMatchCount;
          }

          // 5. Position index (earlier = higher priority)
          return a._relevance.positionIndex - b._relevance.positionIndex;
        });

        // Remove the _relevance field before setting state
        setAddressSuggestions(
          sortedResults.map(({ _relevance, ...rest }) => rest)
        );
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
      setAddressSuggestions([]);
    } finally {
      setLookupLoading(false);
    }
  }, 300);

  // Update the handleSearchInputChange function
  const handleSearchInputChange = async (event, value) => {
    setSearchQuery(value || "");

    if (!value || value.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    searchAddresses(value);
  };

  // Select an address suggestion
  const handleSelectAddress = async (event, value) => {
    if (!value) return;

    setSelectedSuggestion(value);
    setAddressForm({
      address: value.address || "",
      postal_code: value.postal_code || "",
      city: value.city || "",
      district: value.district || "",
      state: value.state || "",
      country: value.country || "India",
      landmark: value.landmark || "",
    });

    // If the address already has an ID, update directly
    if (value._id) {
      setIsLoading(true);
      try {
        // Update the job container to use this address ID
        await axios.patch(
          `${process.env.REACT_APP_API_STRING}/job/${jobId}/container/${containerId}/address/${value._id}`
        );

        // Format the address for display
        const formattedAddress = `${value.address}, ${value.city}, ${
          value.district || ""
        }, ${value.state}, ${value.postal_code}, ${value.country || "India"}`;

        // Update container delivery address in the UI
        container.delivery_address = formattedAddress;
        container.delivery_address_id = value._id;

        // Clear search input and close dropdown
        setSearchQuery("");
        setAddressSuggestions([]);
        setSearchOpen(false);

        // Show success notification
        setShowSuccessNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
      } catch (err) {
        console.error("Error updating delivery address:", err);
        setErrors((prev) => ({
          ...prev,
          general:
            err.response?.data?.message || "Failed to update delivery address",
        }));
        // Open dialog to let user retry
        setDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // If it's a new address without ID, open dialog to confirm
      setDialogOpen(true);
    }
  };

  // Handle opening the dialog
  const handleEditClick = () => {
    setDialogOpen(true);
    setFormSubmitted(false);
  };

  // Handle closing the dialog
  const handleClose = () => {
    setDialogOpen(false);
    setErrors({});
    setFormSubmitted(false);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ["address", "postal_code", "city", "state"];

    requiredFields.forEach((field) => {
      if (!addressForm[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")
        } is required`;
      }
    });

    // Special validation for postal code
    if (
      addressForm.postal_code &&
      !validatePostalCode(addressForm.postal_code)
    ) {
      newErrors.postal_code = "Please enter a valid 6-digit PIN code";
    }

    // If district is empty, we'll use city as district in the payload, so no validation error needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save action - FIXED to preserve API routing
  // Handle save action - FIXED version
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // First, create or update the address in the database
      const addressPayload = {
        address: addressForm.address,
        postal_code: addressForm.postal_code,
        city: addressForm.city,
        district: addressForm.district || addressForm.city, // Use city as district if district is empty
        state: addressForm.state,
        country: addressForm.country || "India",
        landmark: addressForm.landmark || "",
        ieCode: ie_code_no, // Associate with the current IE code
      };

      // Send request to create address - this will either create new or return existing
      const addressResponse = await axios.post(
        `${process.env.REACT_APP_API_STRING}/delivery-address`,
        addressPayload
      );

      // Extract the address ID from the response
      const addressId =
        addressResponse.data._id || addressResponse.data.address._id;

      if (!addressId) {
        throw new Error("Failed to get address ID from server response");
      }

      // Now update the job container to use this address ID
      await axios.patch(
        `${process.env.REACT_APP_API_STRING}/job/${jobId}/container/${containerId}/address/${addressId}`
      );

      // Format the address for display
      const formattedAddress = `${addressForm.address}, ${addressForm.city}, ${
        addressForm.district || ""
      }, ${addressForm.state}, ${addressForm.postal_code}, ${
        addressForm.country
      }`;

      // Update container delivery address in the UI
      container.delivery_address = formattedAddress;
      container.delivery_address_id = addressId;

      setFormSubmitted(true);

      // Close dialog after showing success message
      setTimeout(() => {
        setDialogOpen(false);
        setErrors({});
        setSelectedSuggestion(null);

        // Show success notification
        setShowSuccessNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
      }, 2000);
    } catch (err) {
      console.error("Error updating delivery address:", err);
      console.error("Error details:", err.response?.data);
      setErrors((prev) => ({
        ...prev,
        general: err.response?.data?.message || "Failed to update address",
      }));
    } finally {
      setIsLoading(false);
    }
  };
  // Function to highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;

    try {
      const regex = new RegExp(`(${query})`, "gi");
      return text.replace(regex, "<strong>$1</strong>");
    } catch (e) {
      // In case of invalid regex characters in query
      return text;
    }
  };

  // Add new address form - FIXED field placements and labels
  const renderAddressForm = () => (
    <div>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Address Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please provide the complete delivery address
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Address Line */}
        <Grid item xs={12}>
          <Autocomplete
            freeSolo
            options={addressSuggestions}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : `${option.address}, ${option.city}, ${option.postal_code}`
            }
            filterOptions={(x) => x} // Disable client-side filtering
            loading={lookupLoading}
            value={addressForm.address || ""}
            onInputChange={(event, value) => {
              setAddressForm((prev) => ({ ...prev, address: value }));
              if (value && value.length > 2) {
                searchAddresses(value);
              }
            }}
            onChange={(event, value) => {
              if (value && typeof value !== "string") {
                // If a suggestion is selected, fill the form
                setAddressForm({
                  address: value.address || "",
                  postal_code: value.postal_code || "",
                  city: value.city || "",
                  district: value.district || "",
                  state: value.state || "",
                  country: value.country || "India",
                  landmark: value.landmark || "",
                });
                setSelectedSuggestion(value);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Address Line*"
                variant="outlined"
                required
                error={!!errors.address}
                helperText={
                  errors.address ||
                  "Enter building name, street, area or search existing addresses"
                }
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <PlaceIcon color="action" sx={{ mr: 1 }} />,
                  endAdornment: (
                    <>
                      {lookupLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} style={{ padding: "8px 16px" }}>
                <div>
                  <Typography
                    variant="body1"
                    component="div"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatch(
                        option.address,
                        addressForm.address
                      ),
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    dangerouslySetInnerHTML={{
                      __html: `${highlightMatch(
                        option.city,
                        addressForm.address
                      )}, ${highlightMatch(
                        option.state,
                        addressForm.address
                      )}, ${highlightMatch(
                        option.postal_code,
                        addressForm.address
                      )}`,
                    }}
                  />
                </div>
              </li>
            )}
          />
        </Grid>

        {/* PIN Code and Landmark */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="PIN Code*"
            variant="outlined"
            value={addressForm.postal_code}
            onChange={handleFieldChange("postal_code")}
            required
            error={!!errors.postal_code}
            helperText={
              errors.postal_code ||
              "Enter 6-digit PIN code to auto-fill address details"
            }
            InputProps={{
              endAdornment: lookupLoading ? (
                <CircularProgress size={20} />
              ) : lookupSuccess ? (
                <CheckCircleIcon color="success" />
              ) : (
                <IconButton
                  onClick={() =>
                    fetchAddressByPostalCode(addressForm.postal_code)
                  }
                  disabled={!validatePostalCode(addressForm.postal_code)}
                  size="small"
                >
                  <MyLocationIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Landmark"
            variant="outlined"
            value={addressForm.landmark}
            onChange={handleFieldChange("landmark")}
            helperText="Nearby landmark (optional) for easier identification"
          />
        </Grid>

        {/* City, District, State */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City*"
            variant="outlined"
            value={addressForm.city}
            onChange={handleFieldChange("city")}
            required
            error={!!errors.city}
            helperText={errors.city}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="District"
            variant="outlined"
            value={addressForm.district}
            onChange={handleFieldChange("district")}
            helperText="District (optional - will use city if empty)"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State*"
            variant="outlined"
            value={addressForm.state}
            onChange={handleFieldChange("state")}
            required
            error={!!errors.state}
            helperText={errors.state}
          />
        </Grid>

        {/* Country */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Country"
            variant="outlined"
            value={addressForm.country}
            onChange={handleFieldChange("country")}
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: "action.hover" }}
          />
        </Grid>
      </Grid>

      {errors.general && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "error.lighter", borderRadius: 1 }}>
          <Typography
            color="error"
            variant="body2"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <ErrorOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            {errors.general}
          </Typography>
        </Box>
      )}
    </div>
  );

  // Success confirmation view
  const renderSuccessView = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Address Saved Successfully!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The delivery address has been updated for this container.
      </Typography>
    </Box>
  );

  // MAIN RENDER
  return (
    <Box
      sx={{
        // backgroundColor: "red",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        // alignItems: isCentered ? "center" : "flex-start",
      }}
    >
      {/* Search and Edit Bar */}
      <Box display={"flex"} width={"20rem"}>
        <Box
          sx={{
            // backgroundColor: "yellow",
            width: "80%",
            minHeight: "36px",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.5,
            //backgroundColor: "background.paper", // Changed from purple/red to white
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: isCentered ? "center" : "flex-start",
            overflow: "visible",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              // backgroundColor: "yellow",
              width: "100%",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              textAlign: isCentered ? "center" : "left",
              color: delivery_address ? "text.primary" : "text.secondary",
              fontStyle: delivery_address ? "normal" : "italic",
            }}
          >
            {delivery_address || "No delivery address specified"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            // width: "100%",
            justifyContent: isCentered ? "center" : "flex-start",
            alignItems: "center",
            mb: 1,
            ml: "0.5rem",
          }}
        >
          <Tooltip title="Edit delivery address">
            <IconButton
              size="small"
              onClick={handleEditClick}
              sx={{
                ml: 1,
                bgcolor: "background.paper",
                borderRadius: "50%",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Address Display Box */}
      </Box>

      {/* Enhanced Address Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {formSubmitted ? "Address Updated" : "Edit Delivery Address"}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: "primary.contrastText",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {formSubmitted ? renderSuccessView() : renderAddressForm()}
        </DialogContent>

        {!formSubmitted && (
          <DialogActions
            sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
          >
            <Button
              onClick={handleClose}
              disabled={isLoading}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              {isLoading ? "Saving..." : "Save Address"}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Success Notification */}
      {showSuccessNotification && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            bgcolor: "success.main",
            color: "white",
            p: 2,
            borderRadius: 1,
            boxShadow: 2,
            zIndex: 1500,
            display: "flex",
            alignItems: "center",
          }}
        >
          <CheckCircleIcon sx={{ mr: 1 }} />
          <Typography variant="body2">Address updated successfully!</Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(EditableDeliveryAddressCell);
