import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Assessment,
  Calculate,
  CameraAlt,
  QrCodeScanner,
  Business,
  Description,
  AdminPanelSettings,
  People,
  Security,
  Assignment,
  Save,
  Cancel,
  Edit,
  Visibility,
  VisibilityOff,
  ContactSupport,
  Lock,
  Dashboard,
  Apps,
  Person,
  LockOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { validateSuperAdminToken } from "../utils/tokenValidation";

// Module icons mapping
const moduleIcons = {
  "/importdsr": <Assessment />,
  "/netpage": <Calculate />,
  "http://snapcheckv1.s3-website.ap-south-1.amazonaws.com/": <CameraAlt />,
  "http://qrlocker.s3-website.ap-south-1.amazonaws.com/": <QrCodeScanner />,
  "http://task-flow-ai.s3-website.ap-south-1.amazonaws.com/": <Security />,
  "#": <LockOutlined />,
};

// Module category colors
const categoryColors = {
  core: "primary",
  beta: "warning",
  "coming-soon": "default",
  admin: "secondary",
};

function ModuleAccessManagement() {
  const [customers, setCustomers] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModules, setCustomerModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [bulkModules, setBulkModules] = useState([]);

  const navigate = useNavigate();

  // Helper function to get SuperAdmin authorization headers
  const getSuperAdminHeaders = () => {
    const validation = validateSuperAdminToken();

    if (!validation.isValid) {
      navigate("/superadmin-login");
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${validation.token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
  };

  // Fetch available modules and customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getSuperAdminHeaders();
        if (!headers) return;

        const [modulesRes, customersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_STRING}/modules/available`, headers),
          axios.get(`${process.env.REACT_APP_API_STRING}/modules/customers`, headers),
        ]);

        setModules(modulesRes.data.data);
        setCustomers(customersRes.data.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load module management data");
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/superadmin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Fetch customer-specific module assignments
  const fetchCustomerModules = async (customerId) => {
    try {
      const headers = getSuperAdminHeaders();
      if (!headers) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_STRING}/modules/customer/${customerId}`,
        headers
      );

      setCustomerModules(response.data.data.customer.assignedModules || []);
    } catch (error) {
      console.error("Error fetching customer modules:", error);
      setError("Failed to load customer module assignments");
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModules(customer.assignedModules || []);
    setError(null);
    setSuccess(null);
  };

  // Handle module toggle for selected customer
  const handleModuleToggle = (moduleId) => {
    setCustomerModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Save module assignments for selected customer
  const handleSaveAssignments = async () => {
    if (!selectedCustomer) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const headers = getSuperAdminHeaders();
      if (!headers) return;

      await axios.put(
        `${process.env.REACT_APP_API_STRING}/modules/customer/${selectedCustomer._id}`,
        { assignedModules: customerModules },
        headers
      );

      // Update customer in the list
      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === selectedCustomer._id
            ? { ...customer, assignedModules: customerModules }
            : customer
        )
      );

      setSuccess(`Module assignments updated successfully for ${selectedCustomer.name}!`);
    } catch (error) {
      console.error("Error saving module assignments:", error);
      setError(error.response?.data?.message || "Failed to save module assignments");
    } finally {
      setSaving(false);
    }
  };

  // Handle bulk assignment
  const handleBulkAssign = async () => {
    if (selectedCustomers.length === 0 || bulkModules.length === 0) {
      setError("Please select customers and modules for bulk assignment");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const headers = getSuperAdminHeaders();
      if (!headers) return;

      await axios.post(
        `${process.env.REACT_APP_API_STRING}/modules/bulk-assign`,
        {
          customerIds: selectedCustomers,
          assignedModules: bulkModules,
        },
        headers
      );

      // Refresh customer data
      const customersRes = await axios.get(
        `${process.env.REACT_APP_API_STRING}/modules/customers`,
        headers
      );
      setCustomers(customersRes.data.data);

      setSuccess(`Bulk assignment completed for ${selectedCustomers.length} customers!`);
      setShowBulkAssign(false);
      setSelectedCustomers([]);
      setBulkModules([]);
    } catch (error) {
      console.error("Error in bulk assignment:", error);
      setError(error.response?.data?.message || "Failed to perform bulk assignment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading Module Access Management...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Typography color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
            <Dashboard sx={{ mr: 0.5, fontSize: "1rem" }} />
            Dashboard
          </Typography>
          <Typography color="primary" sx={{ display: "flex", alignItems: "center" }}>
            <Apps sx={{ mr: 0.5, fontSize: "1rem" }} />
            Module Access Management
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            mb: 3,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                mb: 0.5,
              }}
            >
              Module Access Management
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
            >
              Assign and manage module access permissions for customers
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => setShowBulkAssign(true)}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Bulk Assign
          </Button>
        </Box>
      </Box>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Customer List */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Customers ({customers.length})
              </Typography>
              
              <List sx={{ maxHeight: "70vh", overflow: "auto" }}>
                {customers.map((customer) => (
                  <ListItem
                    key={customer._id}
                    button
                    selected={selectedCustomer?._id === customer._id}
                    onClick={() => handleCustomerSelect(customer)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: selectedCustomer?._id === customer._id ? "2px solid" : "1px solid",
                      borderColor: selectedCustomer?._id === customer._id ? "primary.main" : "grey.200",
                      bgcolor: selectedCustomer?._id === customer._id ? "primary.50" : "white",
                      "&:hover": {
                        bgcolor: selectedCustomer?._id === customer._id ? "primary.100" : "grey.50",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Person color={selectedCustomer?._id === customer._id ? "primary" : "default"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={customer.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            IE: {customer.ie_code_no}
                          </Typography>
                          <br />
                          <Chip
                            size="small"
                            label={`${customer.assignedModules?.length || 0} modules`}
                            color={customer.assignedModules?.length > 0 ? "success" : "default"}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Module Assignment */}
        <Grid item xs={12} md={8}>
          {selectedCustomer ? (
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Module Access for {selectedCustomer.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      IE Code: {selectedCustomer.ie_code_no}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setCustomerModules(selectedCustomer.assignedModules || [])}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveAssignments}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select modules to grant access. By default, all modules are locked unless explicitly assigned.
                </Typography>

                <Grid container spacing={2}>
                  {modules.map((module) => {
                    const isAssigned = customerModules.includes(module.id);
                    return (
                      <Grid item xs={12} sm={6} key={module.id}>
                        <Card
                          sx={{
                            cursor: "pointer",
                            border: isAssigned ? "2px solid" : "1px solid",
                            borderColor: isAssigned ? "success.main" : "grey.300",
                            bgcolor: isAssigned ? "success.50" : "white",
                            "&:hover": {
                              borderColor: isAssigned ? "success.dark" : "primary.main",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.2s ease",
                          }}
                          onClick={() => handleModuleToggle(module.id)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <Box sx={{ mr: 1, color: isAssigned ? "success.main" : "grey.600" }}>
                                {moduleIcons[module.id] || <Business />}
                              </Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {module.name}
                              </Typography>
                              <Box sx={{ ml: "auto" }}>
                                <Checkbox
                                  checked={isAssigned}
                                  onChange={() => handleModuleToggle(module.id)}
                                  color="success"
                                />
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                              {module.description}
                            </Typography>
                            <Chip
                              size="small"
                              label={module.category}
                              color={categoryColors[module.category]}
                              sx={{ fontSize: "0.7rem" }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3 }}>
              <CardContent sx={{ p: 6, textAlign: "center" }}>
                <Apps sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Select a Customer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a customer from the list to manage their module access permissions
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Bulk Assignment Dialog */}
      <Dialog open={showBulkAssign} onClose={() => setShowBulkAssign(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Module Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Customers:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Customers</InputLabel>
              <Select
                multiple
                value={selectedCustomers}
                onChange={(e) => setSelectedCustomers(e.target.value)}
                renderValue={(selected) => 
                  customers
                    .filter(c => selected.includes(c._id))
                    .map(c => c.name)
                    .join(', ')
                }
              >
                {customers.map((customer) => (
                  <MenuItem key={customer._id} value={customer._id}>
                    <Checkbox checked={selectedCustomers.includes(customer._id)} />
                    <ListItemText primary={customer.name} secondary={customer.ie_code_no} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Modules to Assign:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Modules</InputLabel>
              <Select
                multiple
                value={bulkModules}
                onChange={(e) => setBulkModules(e.target.value)}
                renderValue={(selected) => 
                  modules
                    .filter(m => selected.includes(m.id))
                    .map(m => m.name)
                    .join(', ')
                }
              >
                {modules.map((module) => (
                  <MenuItem key={module.id} value={module.id}>
                    <Checkbox checked={bulkModules.includes(module.id)} />
                    <ListItemText primary={module.name} secondary={module.description} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Alert severity="info">
            This will assign the selected modules to all selected customers, overwriting their current assignments.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkAssign(false)}>Cancel</Button>
          <Button
            onClick={handleBulkAssign}
            variant="contained"
            disabled={saving || selectedCustomers.length === 0 || bulkModules.length === 0}
          >
            {saving ? "Assigning..." : "Assign Modules"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModuleAccessManagement;
