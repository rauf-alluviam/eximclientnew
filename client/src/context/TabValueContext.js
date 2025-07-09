import React, { createContext, useState } from "react";

// Create the context
export const TabValueContext = createContext();

// Create the provider component
export const TabValueProvider = ({ children }) => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <TabValueContext.Provider value={{ tabValue, setTabValue }}>
      {children}
    </TabValueContext.Provider>
  );
};