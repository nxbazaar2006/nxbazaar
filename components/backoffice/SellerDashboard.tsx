import React from "react";
import OverviewCards from "./Seller/OverviewCards";
import { auth } from "@/auth";
import { getProducts } from "@/actions/product";
import { getSales } from "@/actions/sales";

import { Info } from "lucide-react";

export default async function SellerDashboard() {
  // Sales,
  //products
  const session = await auth();
  const user = session?.user;
  const { id, status = false } = user ?? {};

  if (!id) {
    return null;
  }

  const sales = await getSales();
  const salesById = sales.filter((sale) => sale.vendorId === id);
  const productsResponse = await getProducts();
  const products = productsResponse.success ? productsResponse.data : [];
  const productsById = products.filter((product) => product.userId === id);
  if (!status) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen mt-8">
        <div
          id="alert-additional-content-1"
          className="p-4 mb-4 text-red-800 border border-red-300 rounded-2xl bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <div className="flex items-center">
            <Info className="flex-shrink-0 w-4 h-4 me-2" />
            <span className="sr-only">Info</span>
            <h3 className="text-lg font-medium">Account Under Review</h3>
          </div>
          <div className="mt-2 mb-4 text-sm">
            Your account details are currently under review. Please note that it
            may take 24-48 hours for approval. Thank you for your patience.
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* <!-- Card Section --> */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <OverviewCards sales={salesById} products={productsById} />
      </div>
    </div>
  );
}
