export interface Coupon {
  id: string;
  title: string;
  couponCode: string;
  expiryDate: Date | string;
  isActive: boolean;
  vendorId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  vendor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export interface CreateCouponInput {
  title: string;
  couponCode?: string;
  expiryDate: string;
  isActive: boolean;
  vendorId: string;
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {
  id: string;
}

export interface CouponResponse {
  success: boolean;
  data?: Coupon;
  error?: string;
}

export interface CouponsResponse {
  success: boolean;
  data?: Coupon[];
  error?: string;
}
