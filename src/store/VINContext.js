import React, { createContext, useContext, useState } from 'react';

const VINContext = createContext();

export const VINProvider = ({ children }) => {
  const [currentVIN, setCurrentVIN] = useState('');
  const [vinHistory, setVinHistory] = useState([]);
  const [lastVIN, setLastVIN] = useState(''); // Remember last VIN for restoration

  // Update current VIN and remember it as last VIN
  const updateCurrentVIN = (vin) => {
    if (vin && vin !== '') {
      setLastVIN(vin); // Remember non-empty VINs
    }
    setCurrentVIN(vin);
  };

  // Clear all VIN context state but preserve last VIN
  const clearVINContext = () => {
    setCurrentVIN('');
    setVinHistory([]);
    // Note: We don't clear lastVIN here, so user can return to their previous VIN
  };

  // Clear everything including last VIN (for shop changes)
  const clearAllVINContext = () => {
    setCurrentVIN('');
    setLastVIN('');
    setVinHistory([]);
  };

  return (
    <VINContext.Provider value={{
      currentVIN,
      setCurrentVIN: updateCurrentVIN, // Use our custom setter
      lastVIN,
      setLastVIN,
      vinHistory,
      setVinHistory,
      clearVINContext,
      clearAllVINContext,
    }}>
      {children}
    </VINContext.Provider>
  );
};

export const useVINContext = () => useContext(VINContext); 