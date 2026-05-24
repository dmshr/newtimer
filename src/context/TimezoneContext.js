"use client";

import { createContext, useContext, useState, useEffect } from "react";

const TimezoneContext = createContext();

export function TimezoneProvider({ children }) {
  const [tz, setTz] = useState(7); // Default ke GMT+7 (WIB / Server Time)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTz = localStorage.getItem("doge2-timezone");
    if (savedTz) {
      setTz(Number(savedTz));
    }
  }, []);

  const handleSetTz = (newTz) => {
    setTz(newTz);
    localStorage.setItem("doge2-timezone", newTz);
  };

  return (
    <TimezoneContext.Provider value={{ tz, setTz: handleSetTz, mounted }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export const useTimezone = () => useContext(TimezoneContext);