import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";
import onboardingReducer from "./slices/onboardingSlice";
import languageReducer from "./slices/languageSlice";
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    checkout: checkoutReducer,
    onboarding: onboardingReducer,
    language: languageReducer,
  },
});

// ✅ Types (VERY IMPORTANT)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;