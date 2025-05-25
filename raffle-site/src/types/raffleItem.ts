export interface RaffleItem {
  id: string;
  item_number: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[];
  category: string;
  sponsor: string | null;
  item_value: number | null;
  is_over_21: boolean;
  is_local_pickup_only: boolean;
  draw_count: number;
}
