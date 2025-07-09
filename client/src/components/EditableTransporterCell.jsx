import { useState, useEffect } from "react";
import { Tooltip } from "@mui/material";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

// Add CSS for spinner animation
const spinnerKeyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerKeyframes;
  document.head.appendChild(style);
}

const EditableTransporterCell = ({ cell }) => {
  const {
    _id,
    container_nos = [],
  } = cell.row.original;

  console.log("EditableTransporterCell - Job ID:", _id);
  console.log("EditableTransporterCell - Container data:", container_nos);

  const [containers, setContainers] = useState([...container_nos]);
  const [editable, setEditable] = useState(null);
  const [tempTransporterValue, setTempTransporterValue] = useState("");
  const [transporterError, setTransporterError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  
  // Reset data when row changes
  useEffect(() => {
    setContainers([...container_nos]);
    setEditable(null);
    setTempTransporterValue("");
    setTransporterError("");
  }, [cell.row.original]);

  // Handle initiating edit mode
  const handleEditStart = (index) => {
    setEditable(`transporter_${index}`);
    setTempTransporterValue(containers[index]?.transporter || "");
    setTransporterError("");
  };

  // Handle initiating add mode for containers without transporters
  const handleAddStart = (index) => {
    setEditable(`transporter_${index}`);
    setTempTransporterValue("");
    setTransporterError("");
  };

  // Handle transporter input change
  const handleTransporterInputChange = (e) => {
    setTempTransporterValue(e.target.value);
    setTransporterError("");
  };

  // Copy transporter value to clipboard
  const handleCopyTransporter = (text) => {
    if (!text) return;
    
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopySuccess("Copied!");
          setTimeout(() => setCopySuccess(""), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    } else {
      // Fallback approach for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Validate transporter data
  const validateTransporter = (value) => {
    if (!value || value.trim() === "") {
      setTransporterError("Transporter name cannot be empty");
      return false;
    }
    return true;
  };

  // Submit transporter changes
  const handleTransporterSubmit = (index) => {
    if (!validateTransporter(tempTransporterValue)) {
      return;
    }

    setIsLoading(true);

    const updatedContainers = containers.map((container, i) => {
      if (i === index) {
        return {
          ...container,
          transporter: tempTransporterValue,
          transporter_assigned_date: new Date().toISOString()
        };
      }
      return container;
    });

    // Update containers in database
    console.log("Updating job with ID:", _id);
    console.log("Updated containers data:", updatedContainers);
    
    if (!_id) {
      console.error("Job ID is missing or invalid");
      setTransporterError("Cannot update: Job ID is missing");
      setIsLoading(false);
      return;
    }

    axios
      .patch(`${process.env.REACT_APP_API_STRING}/jobs/${_id}`, {
        container_nos: updatedContainers,
      })
      .then((response) => {
        console.log("Update successful:", response.data);
        setContainers(updatedContainers);
        setEditable(null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error updating transporter:", err.response ? err.response.data : err.message);
        setTransporterError(`Failed to update transporter: ${err.response ? err.response.status : 'Network error'}`);
        setIsLoading(false);
      });
  };

  // Handle key press events
  const handleKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleTransporterSubmit(index);
    } else if (e.key === "Escape") {
      setEditable(null);
    }
  };

  const styles = {
    containerWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "8px 0",
    },
    containerBox: {
      border: "1px solid #e1e5e9",
      borderRadius: "8px",
      padding: "20px",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease",
    },
    containerHeader: {
      marginBottom: "16px",
      paddingBottom: "8px",
      borderBottom: "1px solid #f0f0f0",
    },
    containerNumber: {
      fontWeight: "600",
      fontSize: "16px",
      color: "#1a202c",
      letterSpacing: "0.025em",
    },
    transporterSection: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      minHeight: "40px",
    },
    transporterLabel: {
      fontSize: "14px",
      color: "#4a5568",
      fontWeight: "500",
      minWidth: "90px",
    },
    transporterInfo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flex: 1,
    },
    transporterName: {
      fontSize: "15px",
      color: "#2d3748",
      fontWeight: "500",
      padding: "4px 8px",
      backgroundColor: "#f7fafc",
      borderRadius: "6px",
      border: "1px solid #e2e8f0",
    },
    transporterDate: {
      color: "#718096",
      fontSize: "13px",
      marginLeft: "auto",
      fontStyle: "italic",
    },
    transporterNotAssigned: {
      color: "#a0aec0",
      fontSize: "14px",
      fontStyle: "italic",
      padding: "4px 8px",
      backgroundColor: "#f8f9fa",
      borderRadius: "6px",
      border: "1px dashed #e2e8f0",
    },
    actionButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      cursor: "pointer",
      padding: "8px 16px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
    },
    copyButton: {
      background: "none",
      border: "1px solid #e2e8f0",
      cursor: "pointer",
      padding: "6px",
      borderRadius: "6px",
      color: "#718096",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
    },
    copySuccess: {
      fontSize: "12px",
      color: "#38a169",
      marginLeft: "8px",
      fontWeight: "500",
    },
    transporterActions: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    transporterInput: {
      padding: "12px 16px",
      borderRadius: "8px",
      border: "2px solid #e2e8f0",
      width: "100%",
      fontSize: "15px",
      backgroundColor: "#ffffff",
      transition: "all 0.2s ease",
      fontFamily: "inherit",
      outline: "none",
    },
    transporterInputFocus: {
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
    errorInput: {
      borderColor: "#e53e3e",
      boxShadow: "0 0 0 3px rgba(229, 62, 62, 0.1)",
    },
    errorText: {
      color: "#e53e3e",
      fontSize: "13px",
      marginTop: "4px",
      fontWeight: "500",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
    },
    submitButton: {
      background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "12px 24px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(72, 187, 120, 0.3)",
      minWidth: "80px",
    },
    submitButtonDisabled: {
      background: "#a0aec0",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    cancelButton: {
      backgroundColor: "transparent",
      color: "#718096",
      border: "2px solid #e2e8f0",
      borderRadius: "8px",
      padding: "12px 24px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      minWidth: "80px",
    },
    spinner: {
      display: "inline-block",
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      borderTopColor: "#fff",
      animation: "spin 1s linear infinite",
    },
  };

  return (
    <div style={styles.containerWrapper}>
      {containers.map((container, id) => (
        <div key={id} style={styles.containerBox}>
          <div style={styles.containerHeader}>
            <span style={styles.containerNumber}>
              {container.container_number || container.container_no || `Container #${id + 1}`}
            </span>
          </div>
          
          {editable !== `transporter_${id}` ? (
            <div style={styles.transporterSection}>
              <span style={styles.transporterLabel}>Transporter:</span>
              <div style={styles.transporterInfo}>
                {container.transporter ? (
                  <>
                    <span style={styles.transporterName}>{container.transporter}</span>
                    
                    <Tooltip title="Copy transporter name">
                      <button 
                        onClick={() => handleCopyTransporter(container.transporter)}
                        style={styles.copyButton}
                        onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e0'}
                        onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
                      >
                        <ContentCopyIcon style={{ fontSize: 16 }} />
                      </button>
                    </Tooltip>
                    
                    {copySuccess && <span style={styles.copySuccess}>{copySuccess}</span>}
                    
                    {container.transporter_assigned_date && (
                      <span style={styles.transporterDate}>
                        Assigned: {formatDate(container.transporter_assigned_date)}
                      </span>
                    )}
                    
                    <button
                      onClick={() => handleEditStart(id)}
                      style={styles.actionButton}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <span style={styles.transporterNotAssigned}>No transporter assigned</span>
                    <button
                      onClick={() => handleAddStart(id)}
                      style={styles.actionButton}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      Assign
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.transporterActions}>
              <input
                type="text"
                value={tempTransporterValue}
                onChange={handleTransporterInputChange}
                onKeyDown={(e) => handleKeyPress(e, id)}
                placeholder="Enter transporter name"
                autoFocus
                style={{
                  ...styles.transporterInput,
                  ...(transporterError ? styles.errorInput : {})
                }}
                onFocus={(e) => {
                  if (!transporterError) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!transporterError) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              
              {transporterError && (
                <div style={styles.errorText}>{transporterError}</div>
              )}
              
              <div style={styles.buttonGroup}>
                <button
                  style={{
                    ...styles.submitButton,
                    ...(isLoading ? styles.submitButtonDisabled : {})
                  }}
                  onClick={() => handleTransporterSubmit(id)}
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(72, 187, 120, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(72, 187, 120, 0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <span style={styles.spinner}></span>
                  ) : (
                    "Save"
                  )}
                </button>
                
                <button
                  style={styles.cancelButton}
                  onClick={() => setEditable(null)}
                  disabled={isLoading}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f7fafc';
                    e.target.style.borderColor = '#cbd5e0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditableTransporterCell;