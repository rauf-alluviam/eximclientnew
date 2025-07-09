import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { InfoOutlined as InfoIcon, Calculate as CalculateIcon } from "@mui/icons-material";
import NetWeightCalculator from "./NetWeightCalculator";

const ChargesCell = ({ cell, row }) => {
  const data = cell.getValue();
  const jobNo = row?.original?.job_no;
  const totalDuty = row?.original?.total_duty;
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
//   console.log(data);
  // Style for the cell content
  const centeredCellStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  };
  
  // Handle if no data
  if (!data) return <div style={centeredCellStyle}>N/A</div>;
  
  // Check if per_kg_cost exists and has a value
  const hasPerKgCost = data.net_weight_calculator?.per_kg_cost && parseFloat(data.net_weight_calculator.per_kg_cost) > 0;
  if (!hasPerKgCost) {
    return <div style={centeredCellStyle}>Not calculated</div>;
  }

  // Function to create a detailed breakdown of charges
  const getChargesBreakdown = () => {
    // Basic charges
    const charges = [
      { name: "Duty", value: data.duty || "0.00" },
      { name: "Shipping", value: data.shipping || "0.00" },
      { name: "Custom Clearance", value: data.custom_clearance_charges || data.customclearancecharges || "0.00" },
      { name: "Detention", value: data.detention || "0.00" },
      { name: "CFS/ICD", value: data.cfs || "0.00" },
      { name: "Transport", value: data.transport || "0.00" },
      { name: "Labour", value: data.Labour || "0.00" }
    ];

    console.log("Charges: ", charges);

    // Add any custom fields if they exist
    if (data.custom_fields && Array.isArray(data.custom_fields)) {
      data.custom_fields.forEach(field => {
        charges.push({ name: field.name, value: field.value || "0.00" });
      });
    }

    // Return a formatted breakdown
    return charges
      .filter(charge => parseFloat(charge.value) > 0)
      .map(charge => (
        <div key={charge.name} style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          margin: "2px 0" 
        }}>
          <span>{charge.name}:</span>
          <span style={{ fontWeight: "500" }}>₹{charge.value}</span>
        </div>
      ));
  };

  // Show a tooltip with detailed breakdown on hover
  const tooltipContent = (
    <div style={{ 
      padding: "8px", 
      maxWidth: "220px", 
      fontSize: "0.8rem"
    }}>
      <div style={{ 
        fontWeight: "bold", 
        borderBottom: "1px solid #E5E7EB", 
        paddingBottom: "4px", 
        marginBottom: "4px" 
      }}>
        Charges Breakdown
      </div>
      {getChargesBreakdown()}
      <div style={{ 
        borderTop: "1px solid #E5E7EB", 
        marginTop: "4px", 
        paddingTop: "4px", 
        display: "flex", 
        justifyContent: "space-between",
        fontWeight: "bold" 
      }}>
        <span>Total:</span>
        <span>₹{data.total_cost || "0.00"}</span>
      </div>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between",
        color: "#059669",
        fontWeight: "bold"
      }}>
        <span>Per KG Cost:</span>
        <span>₹{data.net_weight_calculator?.per_kg_cost || "0.00"}/kg</span>
      </div>
    </div>
  );

  return (
    <div style={{
      ...centeredCellStyle,
      padding: "4px",
      cursor: "default",
    }}>
      <div style={{ position: "relative", width: "100%" }}>
        {/* Per KG Cost */}
        <div style={{ 
          fontWeight: "bold", 
          color: "#059669", 
          textAlign: "center" 
        }}>
          ₹{data.net_weight_calculator?.per_kg_cost || "0.00"}/kg
        </div>
        
        {/* Total Cost */}
        <div style={{ 
          fontSize: "0.8rem", 
          color: "#374151", 
          textAlign: "center" 
        }}>
          Total: ₹{data.total_cost || "0.00"}
        </div>
        
        {/* Weight */}
        {data.weight && (
          <div style={{ 
            fontSize: "0.75rem", 
            color: "#6B7280", 
            textAlign: "center" 
          }}>
            ({data.weight} kg)
          </div>
        )}
        
        {/* Info tooltip */}
        <Tooltip 
          title={tooltipContent} 
          arrow 
          placement="right"
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: 'white',
                color: 'black',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '& .MuiTooltip-arrow': {
                  color: 'white',
                },
              },
            },
          }}
        >
          <IconButton 
            size="small" 
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              padding: "2px",
            }}
          >
            <InfoIcon fontSize="small" color="action" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Add calculator button at the end */}
      <div style={{ position: "absolute", top: "2px", right: "20px" }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row selection
            setAnchorEl(e.currentTarget);
            setCalculatorOpen(true);
          }}
          sx={{
            padding: "2px",
            "&:hover": {
              backgroundColor: "rgba(229, 231, 235, 0.5)",
            },
          }}
        >
          <CalculateIcon fontSize="small" sx={{ color: "#059669" }} />
        </IconButton>
      </div>
      
      {/* Render the calculator when open */}
      {calculatorOpen && jobNo && (
        <NetWeightCalculator
          open={calculatorOpen}
          onClose={() => {
            setCalculatorOpen(false);
            setAnchorEl(null);
          }}
          jobNo={jobNo}
          initialWeight={data?.weight || "0.00"}
          initialDuty={totalDuty || "0.00"}
          anchorEl={anchorEl}
          onPerKgCostUpdate={(cost) => {
            // You could refresh the data here if needed
          }}
        />
      )}
    </div>
  );
};

export default ChargesCell;
