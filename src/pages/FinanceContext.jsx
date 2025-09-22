import React, { createContext, useContext } from "react";
import Finance from "./Finance";

export const FinanceContext = createContext(null);
export const useFinance = () => useContext(FinanceContext);

export default function FinanceProvider({ children }) {
  // Render <Finance> but also make its state/derived values accessible
  return (
    <Finance>
      {(financeState) => (
        <FinanceContext.Provider value={financeState}>
          {children}
        </FinanceContext.Provider>
      )}
    </Finance>
  );
}
