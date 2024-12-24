import React, { createContext, useState, useContext, ReactNode } from "react";

type MarketplaceContextType = {
  loading: boolean;
  setLoading: (value: boolean) => void;
  message: string;
  setMessage: (value: string) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
};

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);

  return (
    <MarketplaceContext.Provider value={{ loading, setLoading, message, setMessage, error, setError }}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error("useMarketplace must be used within MarketplaceProvider");
  return context;
};
