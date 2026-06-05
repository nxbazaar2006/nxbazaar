export interface Sale {
  id: string;
  orderId: string;
  vendorId: string;

  productTitle: string;
  productImage: string;
  productPrice: number;
  productQty: number;
  total: number;

  createdAt: string;

  order?: {
    id: string;
    firstName: string;
    email: string;
    phone: string;
    orderNumber: string;
  };
}
