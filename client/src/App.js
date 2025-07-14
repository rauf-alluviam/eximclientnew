import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";

import { TabValueProvider } from "./context/TabValueContext";
import { UserContext } from "./context/UserContext";
import { SelectedYearContext } from "./context/SelectedYearContext";
import { ImportersProvider } from "./context/importersContext";
import AppbarComponent from "./components/home/AppbarComponent";
import NetPage from "./components/Net weight/NetPage.jsx";
import HomePage from "./pages/HomePage.jsx";


// import { validateSuperAdminToken } from "./utils/tokenValidation";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("exim_user") !== null;

  // Don't interfere with SuperAdmin routes - but still call useEffect
  const shouldBypass = location.pathname.startsWith('/superadmin-dashboard') || 
                      location.pathname.startsWith('/module-access-management') ||
                      location.pathname === '/superadmin-login';

  useEffect(() => {
    if (!shouldBypass && !isAuthenticated && location.pathname !== "/login") {
      // Redirect to login page if not authenticated
      navigate("/login", { replace: true });
    }
  }, [shouldBypass, isAuthenticated, navigate, location.pathname]);

  // Early return after hooks
  if (shouldBypass) {
    return children;
  }

  return isAuthenticated ? children : null;
};

// SuperAdmin protected route component


// Route-aware session manager

function App() {
  const [user, setUser] = React.useState(() => {
    // Initialize user state from localStorage if available
    const savedUser = localStorage.getItem("exim_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedYear, setSelectedYear] = React.useState("");

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SelectedYearContext.Provider value={{ selectedYear, setSelectedYear }}>
        <TabValueProvider>
          <ImportersProvider>
            <BrowserRouter>
            
              
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
               
               
                <Route path="/" element={<HomePage />} />
                <Route path="/netpage" element={<NetPage />} />
                <Route
                  path="/importdsr"
                  element={
                    <ProtectedRoute>
                      <AppbarComponent />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </ImportersProvider>
        </TabValueProvider>
      </SelectedYearContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
