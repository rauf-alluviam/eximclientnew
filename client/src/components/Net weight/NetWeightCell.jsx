import React, { useState, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Calculate as CalculateIcon } from "@mui/icons-material";
import NetWeightCalculator from "./NetWeightCalculator";

const NetWeightCell = ({ cell, row }) => {
  // Get values from the row data
  const weight = cell.getValue();
  const jobNo = row.original.job_no;
  const totalDuty = row.original.total_duty || "";

  // Initialize perKgCost from row.original if available
  const [perKgCost, setPerKgCost] = useState(row.original.net_weight_calculator?.per_kg_cost || null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch per kg cost on initial render
  useEffect(() => {
    // Only fetch if we have a jobNo and no perKgCost already
    if (jobNo && !perKgCost) {
      fetchPerKgCost(jobNo);
    }
  }, [jobNo]);

  // Function to fetch per kg cost from API
  const fetchPerKgCost = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_STRING}/get-duties/${jobId}`
      );

      if (response.ok) {
        const responseData = await response.json();

        if (
          responseData.success &&
          responseData.data &&
          responseData.data.per_kg_cost
        ) {
          setPerKgCost(responseData.data.per_kg_cost);
        }
      }
    } catch (error) {
      console.error("Error fetching per kg cost:", error);
    }
  };

  // Handler for when the calculator updates the per kg cost
  const handlePerKgCostUpdate = (cost) => {
    setPerKgCost(cost);

    // Also update the row.original data if possible
    if (row.original) {
      if (!row.original.net_weight_calculator) {
        row.original.net_weight_calculator = {};
      }
      row.original.net_weight_calculator.per_kg_cost = cost;
    }
  };

  // Handler for when the calculator icon is clicked
  const handleOpenCalculator = (event) => {
    event.stopPropagation(); // Prevent row selection/expansion
    setAnchorEl(event.currentTarget);
    setCalculatorOpen(true);
  };

  // Handler for closing the calculator
  const handleCloseCalculator = () => {
    setCalculatorOpen(false);
    setAnchorEl(null);
  };

  // Style for the cell content
  const centeredCellStyle = {
    display: "flex",
    alignItems: "center",
    height: "100%",
    width: "100%",
  };

  return (
    <div
      style={{
        ...centeredCellStyle,
        flexDirection: "row",
        gap: "4px",
        justifyContent: "center",
      }}
    >
      {/* Weight and Per KG Cost Group */}
      <div
        style={{
          ...centeredCellStyle,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
        }}
      >
        {/* Weight value */}
        <span>{weight ? `${weight} kg` : "N/A"}</span>

        {/* Per KG Cost below */}
        {perKgCost && (
          <span style={{ fontSize: "0.8rem", color: "#666" }}>
            ₹{perKgCost}/kg
          </span>
        )}
      </div>

      {/* Show calculator icon if we have a weight value */}
      {weight && (
        <IconButton
          size="small"
          onClick={handleOpenCalculator}
          sx={{
            padding: "2px",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <Tooltip title="Calculate Per KG Cost">
            <CalculateIcon fontSize="small" />
          </Tooltip>
        </IconButton>
      )}

      {/* Render the calculator when open */}
      {calculatorOpen && (
        <NetWeightCalculator
          open={calculatorOpen}
          onClose={handleCloseCalculator}
          jobNo={jobNo}
          initialWeight={weight}
          initialDuty={totalDuty}
          anchorEl={anchorEl}
          onPerKgCostUpdate={handlePerKgCostUpdate}
          setPerKgCost={setPerKgCost}
          perKgCost={perKgCost}
        />
      )}
    </div>
  );
};

export default NetWeightCell;
