import React, { useState, useEffect } from "react";
import FileUpload from "../utils/FileUpload";
import { FaUpload , FaPen} from "react-icons/fa";
import axios from "axios";
import { Checkbox, FormControlLabel, Tooltip, TextField, IconButton } from "@mui/material";

const ChecklistCell = ({ cell, onDocumentsUpdated }) => {
  const [activeUpload, setActiveUpload] = useState(null);
  const [checklistFiles, setChecklistFiles] = useState(
    cell.row.original.checklist || []
  );
  const [isChecklistApproved, setIsChecklistApproved] = useState(
    cell.row.original.is_checklist_aprroved || false
  );
  const [isChecklistClicked, setIsChecklistClicked] = useState(
    cell.row.original.is_checklist_clicked === true ||
      cell.row.original.is_checklist_clicked === "true"
  );
  const [approvalDate, setApprovalDate] = useState(
    cell.row.original.is_checklist_aprroved_date || null
  );
  const [remarkClient, setRemarkClient] = useState(
    cell.row.original.remark_client || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync checklist documents and approval states
  useEffect(() => {
    setChecklistFiles(cell.row.original.checklist || []);
    setIsChecklistApproved(cell.row.original.is_checklist_aprroved || false);
    setIsChecklistClicked(
      cell.row.original.is_checklist_clicked === true ||
      cell.row.original.is_checklist_clicked === "true"
    );
    setApprovalDate(cell.row.original.is_checklist_aprroved_date || null);
    setRemarkClient(cell.row.original.remark_client || "");
  }, [cell.row.original]);

  const rowId = cell.row.original._id || cell.row.original.id || cell.row.id;

  // Format approval date for display
  const formatApprovalDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleString(); // Shows date and time in local format
    } catch (error) {
      return null;
    }
  };

  // Handle file uploads
  const handleFilesUploaded = async (newFiles) => {
    const updatedFiles = [...checklistFiles, ...newFiles];
    setChecklistFiles(updatedFiles);

    // Update the database with the complete array
    try {
      // Fix: Use the correct API endpoint structure that matches your backend
      await axios.patch(`${process.env.REACT_APP_API_STRING}/jobs/${rowId}`, {
        checklist: updatedFiles,
      });

      // Call parent component's update function if available
      if (onDocumentsUpdated) {
        onDocumentsUpdated(rowId, "checklist", updatedFiles);
      }
    } catch (error) {
      // Add minimal error handling to alert the user
      alert("Failed to update checklist documents. Please try again.");
    }

    // Close the upload popup
    setActiveUpload(null);
  };

  // Handle file delete
  const handleDeleteFile = async (fileUrl) => {
    const updatedFiles = checklistFiles.filter((file) => file !== fileUrl);
    setChecklistFiles(updatedFiles);
    try {
      await axios.patch(`${process.env.REACT_APP_API_STRING}/jobs/${rowId}`, {
        checklist: updatedFiles,
      });
      if (onDocumentsUpdated) {
        onDocumentsUpdated(rowId, "checklist", updatedFiles);
      }
    } catch (error) {
      alert("Failed to delete checklist file. Please try again.");
    }
  };

  // Handle checklist click (when user views a checklist)
  const handleChecklistClick = async () => {
    if (!isChecklistClicked) {
      try {
        await axios.patch(`${process.env.REACT_APP_API_STRING}/jobs/${rowId}`, {
          is_checklist_clicked: true,
        });
        setIsChecklistClicked(true);
        if (onDocumentsUpdated) {
          onDocumentsUpdated(rowId, "is_checklist_clicked", true);
        }
      } catch (error) {
        console.error("Failed to update checklist clicked status:", error);
        // Don't show alert for this as it's not critical to the document viewing
      }
    }
  };

  // Handle checklist approval
  const handleChecklistApproval = async (e) => {
    // Don't allow changes if already approved (approval is final)
    if (isChecklistApproved) {
      return;
    }

    const checked = e.target.checked;
    setIsLoading(true);
    
    try {
      const approvalDateTime = checked ? new Date().toISOString() : null;
      
      await axios.patch(`${process.env.REACT_APP_API_STRING}/jobs/${rowId}`, {
        is_checklist_aprroved: checked,
        is_checklist_aprroved_date: approvalDateTime,
      });
      
      setIsChecklistApproved(checked);
      setApprovalDate(approvalDateTime);
      
      if (onDocumentsUpdated) {
        onDocumentsUpdated(rowId, "is_checklist_aprroved", checked);
      }
    } catch (error) {
      alert("Failed to update checklist approval. Please try again.");
    }
    setIsLoading(false);
  };

  // Handle remark client update
  const handleRemarkClientUpdate = async (remarkText) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_STRING}/jobs/${rowId}`, {
        remark_client: remarkText,
      });
      
      setRemarkClient(remarkText);
      
      if (onDocumentsUpdated) {
        onDocumentsUpdated(rowId, "remark_client", remarkText);
      }
    } catch (error) {
      alert("Failed to update remark. Please try again.");
    }
  };

  // Component to render the upload button and popup
  const renderUploadButton = () => {
    const isActive = activeUpload === "checklist";

    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginLeft: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveUpload(isActive ? null : "checklist")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0",
            color: "#0066cc",
          }}
          title="Upload Checklist Document"
        >
          <FaUpload size={14} />
        </button>

        {isActive && (
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              width: "100px",
              height: "100px",
              padding: "10px",
              borderRadius: "4px",
              right: 0,
              marginTop: "5px",
            }}
          >
            <FileUpload
              label="Upload Checklist"
              bucketPath="checklist"
              onFilesUploaded={(newFiles) => handleFilesUploaded(newFiles)}
              multiple={true}
            />
            <button
              type="button"
              onClick={() => setActiveUpload(null)}
              style={{
                marginTop: "5px",
                padding: "3px 8px",
                background: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "3px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render document links with delete button
  const renderDocumentLinks = (documents) => {
    if (!documents || documents.length === 0) {
      return <span style={{ color: "gray" }}>No Checklist</span>;
    }
    return (
      <>
        {documents.map((doc, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: index === 0 ? 0 : "3px",
            }}
          >
            <a
              href={doc}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChecklistClick}
              style={{
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                display: "block",
              }}
            >
              Checklist {index + 1}
            </a>
            {/* Only show delete button if checklist is not approved */}
            {!isChecklistApproved && (
              <Tooltip title="Delete Checklist File">
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e02251",
                    cursor: "pointer",
                    fontSize: 16,
                    marginLeft: 2,
                  }}
                  onClick={() => handleDeleteFile(doc)}
                  disabled={isLoading}
                  aria-label="Delete Checklist File"
                >
                  ×
                </button>
              </Tooltip>
            )}
          </div>
        ))}
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}>{renderDocumentLinks(checklistFiles)}</div>
        {renderUploadButton()}
      </div>
      <div style={{ marginTop: 8 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecklistApproved}
              onChange={handleChecklistApproval}
              disabled={
                (!isChecklistClicked && !isChecklistApproved) || // Can't approve if not clicked and not already approved
                isChecklistApproved || // Can't change if already approved (approval is final)
                isLoading
              }
              color="primary"
            />
          }
          label="Checklist Approved"
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: '12px'
            }
          }}
          
        />
        
        {/* Show approval date if approved */}
        {isChecklistApproved && approvalDate && (
          <div style={{ color: "green", fontSize: 12, marginTop: 4 }}>
            Approved on: {formatApprovalDate(approvalDate)}
          </div>
        )}
        
        {/* Show remark text box if checklist is NOT approved */}
         {!isChecklistApproved && (
          <div style={{ marginTop: 8, width: "200px" }}>
            {remarkClient ? (
              <TextField
                label=" Remark"
                value={remarkClient}
                onChange={(e) => setRemarkClient(e.target.value)}
                onBlur={(e) => handleRemarkClientUpdate(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRemarkClientUpdate(e.target.value);
                  }
                }}
                multiline
                rows={1}
                size="small"
                variant="outlined"
                placeholder="Enter remark for client..."
                style={{ width: "100%" }}
              />
            ) : (
              <Tooltip title="Add remark for client">
                <IconButton
                  size="small"
                  onClick={() => setRemarkClient(" ")} // Set a space to trigger TextField display
                  style={{ 
                    color: "#666",
                    padding: "4px"
                  }}
                >
                  <FaPen size={12} />
                </IconButton>
              </Tooltip>
            )}
          </div>
        )}
        {/* Show instruction if not clicked and not approved */}
        
      </div>
    </div>
  );
};

export default ChecklistCell;
