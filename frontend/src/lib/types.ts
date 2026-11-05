export type ApiResponse<T> = { success: boolean; data: T; message?: string };

export type Paginated<T> = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: T[];
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  image: string | null;
  is_active: boolean;
};

export type User = { id: number; name: string; email: string };

export type AuthData = {
  user: User;
  authorization: { token: string; type: string };
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product?: Product;
};

export type Payment = {
  id: number;
  stripe_payment_id: string | null;
  amount: string;
  currency: string;
  status: string;
};

export type Order = {
  id: number;
  total: string;
  status: string; // "pending" | "paid"
  created_at: string;
  items?: OrderItem[];
  payment?: Payment | null;
};

export type CartItem = { product: Product; quantity: number };