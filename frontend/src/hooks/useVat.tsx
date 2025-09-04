import { useConfig } from "@/context/ConfigContext";

export const useVat = () => {
  const { vat } = useConfig();
  const getFinalPrice = (price: number) => Math.ceil(price * vat);
  return { vat, getFinalPrice };
};
