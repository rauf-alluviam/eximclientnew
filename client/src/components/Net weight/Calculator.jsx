import { Box, Typography, TextField, Button, IconButton } from "@mui/material";
import { SimpleHeader } from "./SharedComponents";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Calculator = ({
  calculatorData,
  handleInputChange,
  inputRefs,
  saveError,
  jobNo,
  calculationResults,
  calculateCost,
}) => {
  // Add state for custom fields
  const [customFields, setCustomFields] = useState([]);
  const [showCustomFieldRow, setShowCustomFieldRow] = useState(false);
  const [newField, setNewField] = useState({ name: "", value: "" });
  const [customFieldError, setCustomFieldError] = useState("");
  const [editingFieldId, setEditingFieldId] = useState(null);

  // Load custom fields when calculator data changes
  useEffect(() => {
    if (calculatorData && calculatorData.custom_fields) {
      setCustomFields(calculatorData.custom_fields);
    }
  }, [calculatorData]);

  const handleAddFieldClick = () => {
    setShowCustomFieldRow(true);
    setCustomFieldError("");
    setEditingFieldId(null);
    setNewField({ name: "", value: "" });
  };

  const handleCustomFieldChange = (e) => {
    setNewField({ ...newField, [e.target.name]: e.target.value });
  };

  const handleSaveCustomField = () => {
    if (!newField.name.trim()) {
      setCustomFieldError("Please enter a name for the field.");
      return;
    }
    if (!newField.value.trim()) {
      setCustomFieldError("Please enter a value.");
      return;
    }

    let updatedFields;
    
    if (editingFieldId) {
      // Update existing field
      updatedFields = customFields.map(field => 
        field.id === editingFieldId ? { ...newField, id: editingFieldId } : field
      );
    } else {
      // Create a new field with ID
      const newCustomField = { 
        ...newField, 
        id: Date.now().toString() 
      };
      
      // Add to custom fields state
      updatedFields = [...customFields, newCustomField];
    }
    
    setCustomFields(updatedFields);
    
    // Update parent component's state
    if (handleInputChange) {
      const event = {
        target: {
          id: "custom_fields",
          value: updatedFields
        }
      };
      handleInputChange(event);
    }
    
    // Reset form
    setNewField({ name: "", value: "" });
    setShowCustomFieldRow(false);
    setCustomFieldError("");
    setEditingFieldId(null);
  };

  const handleDeleteField = (id) => {
    // Filter out the field with the given id
    const updatedFields = customFields.filter(field => field.id !== id);
    setCustomFields(updatedFields);
    
    // Update parent component's state
    if (handleInputChange) {
      const event = {
        target: {
          id: "custom_fields",
          value: updatedFields
        }
      };
      handleInputChange(event);
    }
  };

  const handleEditField = (field) => {
    setNewField({ name: field.name, value: field.value });
    setEditingFieldId(field.id);
    setShowCustomFieldRow(true);
    setCustomFieldError("");
  };

  // Component for calculator input field
  const CalculatorField = ({
    id,
    label,
    value,
    onChange,
    disabled = false,
  }) => (
    <Box sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "55%", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textPrimary" noWrap>
          {label}
        </Typography>
      </Box>
      <Box sx={{ width: "45%" }}>
        <TextField
          id={id}
          fullWidth
          size="small"
          value={value}
          onChange={onChange}
          disabled={disabled}
          // Use the ref from the inputRefs object
          inputRef={inputRefs && inputRefs[id]}
          inputProps={{
            inputMode: "decimal",
          }}
          placeholder="0.00"
          sx={{
            "& .MuiOutlinedInput-root": { height: 32 },
            "& input": { paddingRight: 1 },
            "& .Mui-disabled": {
              backgroundColor: "#F3F4F6",
              cursor: "not-allowed",
            },
          }}
        />
      </Box>
    </Box>
  );

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      }}
    >
      <SimpleHeader bgColor="#059669">
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            margin: 0,
          }}
        >
          CostIQ
        </h2>
        
      </SimpleHeader>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#F9FAFB",
            borderRadius: "4px",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontWeight: "500",
              color: "#4B5563",
              width: "160px",
            }}
          >
            Job Reference:
          </div>
          <div
            style={{
              fontWeight: "500",
              color: "#4F46E5",
            }}
          >
            {calculatorData.jobReference || jobNo || "N/A"}
          </div>
        </div>

        {saveError && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #EF4444",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "16px",
              color: "#B91C1C",
              fontSize: "14px",
            }}
          >
            Error saving data: {saveError}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          {/* Duty Amount field is now disabled since it's auto-populated */}
          <CalculatorField
            label="Duty Amount (₹)"
            id="duty"
            value={calculatorData.duty}
            onChange={handleInputChange}
            disabled={true}
          />

          <CalculatorField
            label="Shipping Charges (₹)"
            id="shipping"
            value={calculatorData.shipping}
            onChange={handleInputChange}
          />

          <CalculatorField
            label="Custom Clearance Charges (₹)"
            id="customclearancecharges"
            value={calculatorData.customclearancecharges}
            onChange={handleInputChange}
          />
          <CalculatorField
            label="Detention Charges (₹)"
            id="detention"
            value={calculatorData.detention}
            onChange={handleInputChange}
          />

          <CalculatorField
            label="CFS/ICD Charges (₹)"
            id="cfs"
            value={calculatorData.cfs}
            onChange={handleInputChange}
          />

          <CalculatorField
            label="Transport Charges (₹)"
            id="transport"
            value={calculatorData.transport}
            onChange={handleInputChange}
          />

          <CalculatorField
            label="Labour Charges (₹)"
            id="Labour"
            value={calculatorData.Labour}
            onChange={handleInputChange}
          />

          {/* Render custom fields */}
          {customFields && customFields.map((field) => (
            <Box key={field.id} sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
              <Box sx={{ width: "55%", display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="textPrimary" noWrap>
                  {field.name} (₹)
                </Typography>
              </Box>
              <Box sx={{ width: "37%" }}>
                <TextField
                  fullWidth
                  size="small"
                  value={field.value}
                  disabled={true}
                  placeholder="0.00"
                  sx={{
                    "& .MuiOutlinedInput-root": { height: 32 },
                    "& input": { paddingRight: 1 },
                    "& .Mui-disabled": {
                      backgroundColor: "#F3F4F6",
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: "8%", display: "flex", justifyContent: "flex-end" }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleEditField(field)}
                  sx={{ padding: "2px" }}
                >
                  <EditIcon fontSize="small" sx={{ color: "#6B7280" }} />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteField(field.id)}
                  sx={{ padding: "2px" }}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "#EF4444" }} />
                </IconButton>
              </Box>
            </Box>
          ))}

          {/* Add Field Button */}
          {!showCustomFieldRow && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddFieldClick}
              sx={{ 
                mt: 1, 
                mb: 2,
                color: "#059669",
                borderColor: "#059669",
                "&:hover": {
                  borderColor: "#047857",
                  backgroundColor: "#ECFDF5",
                },
              }}
            >
              + Add Field
            </Button>
          )}

          {/* New Custom Field Row */}
          {showCustomFieldRow && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  name="name"
                  value={newField.name}
                  onChange={handleCustomFieldChange}
                  placeholder="Field Label (e.g. Notes, Charges)"
                  size="small"
                  fullWidth
                />
                <TextField
                  name="value"
                  value={newField.value}
                  onChange={handleCustomFieldChange}
                  placeholder="Enter value..."
                  size="small"
                  fullWidth
                  inputProps={{
                    inputMode: "decimal",
                  }}
                />
              </Box>
              
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => {
                    setShowCustomFieldRow(false);
                    setNewField({ name: "", value: "" });
                    setCustomFieldError("");
                    setEditingFieldId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleSaveCustomField}
                  sx={{
                    backgroundColor: "#059669",
                    "&:hover": {
                      backgroundColor: "#047857",
                    },
                  }}
                >
                  {editingFieldId ? "Update" : "Save"}
                </Button>
              </Box>
              
              {/* Validation Error */}
              {customFieldError && (
                <Typography color="error" variant="caption" sx={{ display: "block", mt: 0.5 }}>
                  {customFieldError}
                </Typography>
              )}
            </Box>
          )}

          {/* Net Weight field is now disabled since it's auto-populated */}
          <CalculatorField
            label="Net Weight (KG)"
            id="weight"
            value={calculatorData.weight}
            onChange={handleInputChange}
            inputRef={inputRefs && inputRefs.weight}
          />
        </div>

        {/* Added Calculate button */}
        <Button
          variant="contained"
          fullWidth
          onClick={calculateCost}
          sx={{
            backgroundColor: "#059669",
            color: "white",
            marginBottom: "16px",
            "&:hover": {
              backgroundColor: "#047857",
            },
          }}
        >
          Calculate
        </Button>

        <div
          style={{
            borderRadius: "4px",
            padding: "16px",
            backgroundColor: "#ECFDF5",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div style={{ fontWeight: "500", color: "#374151" }}>
              Total Cost
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#047857",
              }}
            >
              ₹ {calculationResults.totalCost}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: "500", color: "#374151" }}>
              Per KG Cost
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#047857",
              }}
            >
              ₹ {calculationResults.perKgCost}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;