export type Sale = {
  id: string;
  total: number;
  createdAt: string | Date;
  productTitle?: string;
  productQty?: number;
};

export type Order = {
  id: string;
  total?: number;
  orderStatus:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELED";
  createdAt: string | Date;
};

export type Product = {
  id: string;
  title: string;
  productPrice: number;
  createdAt: string;
};
