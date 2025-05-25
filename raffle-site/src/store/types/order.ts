export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_zip: string;
  customer_country: string;
  is_international: boolean;
  age_confirmed: boolean;
  total_amount: number;
  total_tickets: number;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  updated_at: string;
}
