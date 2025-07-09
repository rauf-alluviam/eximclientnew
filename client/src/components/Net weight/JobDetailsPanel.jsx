import { SimpleHeader } from "./SharedComponents";
import { useState, useEffect, useRef } from "react";

const JobDetailsPanel = ({
  years,
  selectedYear,
  setSelectedYear,
  jobNo,
  setJobNo,
  loading,
  handleSearch,
  apiError,
  jobData,
  dutyRates,
  userId // Add userId prop
}) => {
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showJobsList, setShowJobsList] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const dropdownRef = useRef(null);

  // Function to fetch jobs list with optional search
  const fetchJobsList = async (search = "") => {
    if (!userId) return;
    
    setJobsLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_STRING}/get-job-numbers/${userId}?year=${selectedYear}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobsList(data.data);
          // Don't automatically show the list, let user trigger it
        } else {
          setJobsList([]);
          setShowJobsList(false);
        }
      } else {
        setJobsList([]);
        setShowJobsList(false);
      }
    } catch (error) {
      console.error("Error fetching jobs list:", error);
      setJobsList([]);
      setShowJobsList(false);
    } finally {
      setJobsLoading(false);
    }
  };

  // Effect to fetch jobs when year changes or component mounts
  useEffect(() => {
    if (userId && selectedYear) {
      fetchJobsList();
    }
  }, [userId, selectedYear]);

  // Debounce search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm && searchTerm.length > 2) {
        fetchJobsList(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, userId, selectedYear]);

  // Effect to handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowJobsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle job selection from list
  const handleJobSelect = (selectedJobNo) => {
    setJobNo(selectedJobNo);
    setShowJobsList(false);
    // Auto-trigger search when job is selected
    setTimeout(() => {
      handleSearch(); // Now this will work without an event object
    }, 100);
  };

  // Function to get the final assessable value using the logic: if both exist, use larger; if one exists, use that one
  const getFinalAssessableValue = (jobData) => {
    if (jobData.final_assessable_value) {
      // If backend already calculated it, use that
      return jobData.final_assessable_value;
    }
    
    // Fallback logic for client-side calculation
    const assblValue = parseFloat(jobData.assbl_value) || 0;
    const assessableAmount = parseFloat(jobData.assessable_ammount) || 0;
    
    if (assblValue > 0 && assessableAmount > 0) {
      return Math.max(assblValue, assessableAmount).toFixed(2);
    } else if (assblValue > 0) {
      return assblValue.toFixed(2);
    } else if (assessableAmount > 0) {
      return assessableAmount.toFixed(2);
    }
    
    return "0.00";
  };

  // Component for detail field in job details
  const DetailField = ({ label, value }) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "8px 12px",
        borderRadius: "4px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        marginBottom: "8px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#6B7280" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "500" }}>{value}</div>
    </div>
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
      <SimpleHeader bgColor="#4F46E5">
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            margin: 0,
          }}
        >
          Job Details
        </h2>
      </SimpleHeader>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #D1D5DB",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Job Number / Search Exporter
            </label>
            <div style={{ position: "relative", width: "70%" }} ref={dropdownRef}>
              <input
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "4px",
                  paddingRight: "40px",
                }}
                placeholder="Enter Job Number or Search by Exporter Name"
                value={jobNo}
                onChange={(e) => {
                  setJobNo(e.target.value);
                  setSearchTerm(e.target.value);
                }}
                onFocus={() => {
                  setShowJobsList(true);
                  if (jobsList.length === 0) {
                    fetchJobsList(searchTerm);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowJobsList(!showJobsList)}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#6B7280",
                }}
              >
                ▼
              </button>
              
              {/* Jobs List Dropdown */}
              {showJobsList && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #D1D5DB",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {jobsLoading ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "#6B7280" }}>
                      Loading jobs...
                    </div>
                  ) : jobsList.length > 0 ? (
                    jobsList.map((job, index) => (
                      <div
                        key={index}
                        onClick={() => handleJobSelect(job.job_no)}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: index < jobsList.length - 1 ? "1px solid #E5E7EB" : "none",
                          backgroundColor: job.job_no === jobNo ? "#F3F4F6" : "white",
                        }}
                        onMouseEnter={(e) => {
                          if (job.job_no !== jobNo) {
                            e.target.style.backgroundColor = "#F9FAFB";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (job.job_no !== jobNo) {
                            e.target.style.backgroundColor = "white";
                          }
                        }}
                      >
                        <div style={{ fontWeight: "500", fontSize: "14px" }}>
                          {job.job_no}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                          {job.supplier_exporter || "N/A"}
                        </div>
                        {job.job_date && (
                          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>
                            {new Date(job.job_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", textAlign: "center", color: "#6B7280" }}>
                      {searchTerm ? `No jobs found matching "${searchTerm}"` : `No jobs found for ${selectedYear}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            fontSize: "16px",
          }}
        >
          {loading ? "Searching..." : "Search Job"}
        </button>

        {apiError && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #EF4444",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "16px",
              color: "#B91C1C",
            }}
          >
            {apiError}
          </div>
        )}

        {jobData && (
          <div
            style={{
              backgroundColor: "#EEF2FF",
              padding: "16px",
              borderRadius: "4px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "500",
                marginTop: 0,
                marginBottom: "12px",
                color: "#4338CA",
              }}
            >
              Import Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <DetailField
                label="HS Code"
                value={jobData?.hs_code || "N/A"}
              />
              <DetailField
                label="Clearance Type"
                value={jobData.clearanceValue || "N/A"}
              />
              <DetailField
                label="Total Invoice Value"
                value={`$ ${jobData.total_inv_value || "0.00"}`}
              />
              <DetailField
                label="Exchange Rate"
                value={`₹ ${jobData.exrate || "0.00"}`}
              />
              <DetailField
                label="Assessable Value"
                value={`₹ ${getFinalAssessableValue(jobData)}`}
              />
              <DetailField
                label="Net Weight"
                value={`${jobData.job_net_weight || "0.00"} kg`}
              />
              <DetailField
                label="Basic Duty"
                value={`${
                  dutyRates?.basic_duty_ntfn === "nan"
                    ? dutyRates?.basic_duty_sch
                    : dutyRates?.basic_duty_ntfn || dutyRates?.basic_duty_sch || "0.00"
                }%`}
              />
              <DetailField
                label="Basic Duty Amount"
                value={`₹ ${
                  getFinalAssessableValue(jobData) !== "0.00"
                    ? dutyRates?.basic_duty_ntfn === "nan"
                      ? (
                          (parseFloat(getFinalAssessableValue(jobData)) *
                            parseFloat(dutyRates?.basic_duty_sch || 0)) /
                          100
                        ).toFixed(2)
                      : (
                          (parseFloat(getFinalAssessableValue(jobData)) *
                            parseFloat(
                              dutyRates?.basic_duty_ntfn || dutyRates?.basic_duty_sch || 0
                            )) /
                          100
                        ).toFixed(2)
                    : "0.00"
                }`}
              />
              <DetailField
                label="IGST"
                value={`${dutyRates?.igst || "0.00"}%`}
              />
              <DetailField
                label="IGST Amount"
                value={`₹ ${
                  getFinalAssessableValue(jobData) !== "0.00" && dutyRates?.igst
                    ? ((parseFloat(getFinalAssessableValue(jobData)) * parseFloat(dutyRates.igst)) / 100).toFixed(2)
                    : "0.00"
                }`}
              />
              <DetailField label="SWS" value={`10%`} />
            <DetailField
  label="SWS Amount"
  value={`₹ ${
    getFinalAssessableValue(jobData) !== "0.00" && dutyRates?.sws_10_percent
      ? (() => {
          const finalAssessableValue = parseFloat(getFinalAssessableValue(jobData));
          const basicDutyAmount = dutyRates?.basic_duty_ntfn === "nan"
            ? (finalAssessableValue * parseFloat(dutyRates?.basic_duty_sch || 0)) / 100
            : (finalAssessableValue * parseFloat(dutyRates?.basic_duty_ntfn || dutyRates?.basic_duty_sch || 0)) / 100;
          return ((basicDutyAmount * 10) / 100).toFixed(2);
        })()
      : "0.00"
  }`}
/>
              <DetailField
                label="Total duty"
                value={`₹ ${jobData.total_duty || "0.00"} `}
              />
            </div>
          </div>
        )}

        {!jobData && !loading && !apiError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 16px",
              backgroundColor: "#F9FAFB",
              borderRadius: "4px",
              color: "#6B7280",
            }}
          >
            <span style={{ marginRight: "8px" }}>📋</span>
            <span>
              Enter a job number and click search to view job details
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPanel;