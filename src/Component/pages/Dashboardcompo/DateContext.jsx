import React, { createContext, useContext, useState } from "react";

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

  return (
    <DateContext.Provider value={{ selectedRange, setSelectedRange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);
