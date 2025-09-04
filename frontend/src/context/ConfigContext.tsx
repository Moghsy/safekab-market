import { useApi } from "@/hooks/useApi";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ConfigContextType {
  vat: number;
  shippingCost: number;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("ConfigContext is not available");
  }
  return context;
};

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const { api } = useApi();
  const [loading, setLoading] = useState(true);
  const [vat, setVat] = useState(1.2);
  const [shippingCost, setShippingCost] = useState(500); // Default £5.00 in pence
  
  useEffect(() => {
    api
      .getConfig()
      .then((response) => {
        const { vat, shipping_cost } = response;
        setVat(vat);
        setShippingCost(shipping_cost || 500);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <ConfigContext.Provider value={{ vat, shippingCost, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};
