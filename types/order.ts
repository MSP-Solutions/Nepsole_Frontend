import { BookItem } from "./book";

export const ORDER_STATUS_ENUM = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_ENUM)[number];

export const PAYMENT_STATUS_ENUM = ["PENDING", "PAID", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS_ENUM)[number];

export interface DeliveryOption {
  id?: number;
  name: string;
  description?: string;
  cost: number;
  estimatedDays: string;
  isActive?: boolean;
}

export interface DeliveryAddress {
  id?: number;
  userId?: number;
  district?: string;
  phoneNumber?: string;
  province?: string;
  city?: string;
  streetAddress?: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface OrderUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface OrderPayment {
  id?: number;
  orderId?: number;
  method?: string;
  status?: string;
  amount?: number;
  transactionId?: string | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  bookId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  book?: BookItem;
}

export interface GuestCustomer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  district?: string;
  city?: string;
  streetAddress?: string;
  province?: string;
  landmark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  orderType?: "GUEST" | "USER" | string;
  userId?: number | null;
  guestCustomerId?: number | null;
  guestCustomer?: GuestCustomer | null;
  deliveryOptionId?: number;
  deliveryOption?: DeliveryOption;
  deliveryAddressId?: number | null;
  deliveryAddress?: DeliveryAddress | null;
  status: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser | null;
  payment?: OrderPayment;
  items: OrderItem[];
}
