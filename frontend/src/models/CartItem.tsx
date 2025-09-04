import type { ProductImage } from './Product';

export default interface CartItem {
  id: number;
  name: string;
  net_price: number;
  vat_rate: number;
  currency: string;
  description: string;
  stock?: number;
  quantity: number;
  images?: ProductImage[];
}

export const getGrossPrice = (item: CartItem): number => {
  return Math.floor(
    item.net_price * item.quantity +
      (item.net_price * item.quantity * item.vat_rate + 50) / 100
  );
};
