import React, { createContext, useState } from "react";

export const SelectedYearContext = createContext();

export const SelectedYearProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  return (
    <SelectedYearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </SelectedYearContext.Provider>
  );
};
