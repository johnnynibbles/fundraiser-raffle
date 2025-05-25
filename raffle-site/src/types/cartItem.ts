export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_urls: string[];
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  item_number: string;
}
