export interface ProductImage {
  id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  media_type?: "image" | "video";
}

export default interface Product {
  id: number;
  name: string;
  net_price: number;
  vat_rate: number;
  currency: string;
  description: string;
  stock?: number;
  images?: ProductImage[];
}

export function getGrossPrice(product: Product): number {
  return Math.floor(
    product.net_price + (product.net_price * product.vat_rate + 50) / 100
  );
}
