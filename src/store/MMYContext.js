import React, { createContext, useContext, useState } from 'react';

const MMYContext = createContext();

export const MMYProvider = ({ children }) => {
  const [currentMake, setCurrentMake] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [lastMMY, setLastMMY] = useState({ make: '', model: '', year: '' }); // Remember last MMY for restoration

  // Update current MMY and remember it as last MMY
  const updateCurrentMMY = (make, model, year) => {
    const mmy = { make, model, year };
    if (make && model && year) {
      setLastMMY(mmy); // Remember complete MMY combinations
    }
    setCurrentMake(make);
    setCurrentModel(model);
    setCurrentYear(year);
  };

  // Clear all MMY context state but preserve last MMY
  const clearMMYContext = () => {
    setCurrentMake('');
    setCurrentModel('');
    setCurrentYear('');
    // Note: We don't clear lastMMY here, so user can return to their previous MMY
  };

  // Clear everything including last MMY (for shop changes)
  const clearAllMMYContext = () => {
    setCurrentMake('');
    setCurrentModel('');
    setCurrentYear('');
    setLastMMY({ make: '', model: '', year: '' });
  };

  return (
    <MMYContext.Provider value={{
      currentMake,
      setCurrentMake,
      currentModel,
      setCurrentModel,
      currentYear,
      setCurrentYear,
      lastMMY,
      setLastMMY,
      updateCurrentMMY,
      clearMMYContext,
      clearAllMMYContext,
    }}>
      {children}
    </MMYContext.Provider>
  );
};

export const useMMYContext = () => useContext(MMYContext); 