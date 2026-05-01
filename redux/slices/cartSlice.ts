import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ================= TYPES ================= */

export interface CartItem {
  id: string;
  title: string;
  salePrice: number;
  qty: number;
  imageUrl?: string;
  productVariantId?: string;
  vendorId?: string;
}

/* ================= INITIAL STATE ================= */

const getInitialState = (): CartItem[] => {
  // 🚨 SSR safe
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem("cart");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const initialState: CartItem[] = getInitialState();

/* ================= SLICE ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, "qty">>
    ) => {
      console.log("ADDING TO CART:", action.payload);

      const existingItem = state.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.push({
          ...action.payload,
           salePrice: Number(action.payload.salePrice), 
          qty: 1,
        });
      }

      // ✅ localStorage sync
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state));
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const newState = state.filter(
        (item) => item.id !== action.payload
      );

      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(newState));
      }

      return newState;
    },

    incrementQty: (state, action: PayloadAction<string>) => {
      const item = state.find((i) => i.id === action.payload);

      if (item) {
        item.qty += 1;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state));
      }
    },

    decrementQty: (state, action: PayloadAction<string>) => {
      const item = state.find((i) => i.id === action.payload);

      if (item && item.qty > 1) {
        item.qty -= 1;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state));
      }
    },

    clearCart: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
      }
      return [];
    },
  },
});

/* ================= EXPORTS ================= */

export const {
  addToCart,
  removeFromCart,
  incrementQty,
  decrementQty,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
