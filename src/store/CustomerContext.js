import React, { createContext, useState } from 'react';

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);

  return (
    <CustomerContext.Provider value={{ customer, setCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
};