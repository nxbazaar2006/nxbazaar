import CartProduct from "./CartProduct";
import EmptyCart from "./EmptyCart";

/* ================= TYPES ================= */

type CartItem = {
  id: string;
  title: string;
  salePrice: number;
  imageUrl?: string;
  qty: number;
};

type Props = {
  cartItems: CartItem[];
};

export default function CartItems({ cartItems }: Props) {
  const hasItems = cartItems.length > 0;

  return (
    <div className="col-span-full md:col-span-8">
      {hasItems ? (
        <div
          className="
            neumorphic-card rounded-3xl
            p-4 shadow-sm md:p-6
          "
        >
          <h2 className="text-foreground mb-6 text-2xl font-semibold tracking-tight">
            Shopping Cart
          </h2>

          <div
            className="
              mb-4 hidden grid-cols-12 border-b border-white/10
              pb-3 text-xs font-semibold uppercase tracking-wider
              text-muted-foreground md:grid
            "
          >
            <h2 className="text-foreground col-span-6">Product</h2>
            <h2 className="text-foreground col-span-3 text-center">Quantity</h2>
            <h2 className="text-foreground col-span-3 text-right">Price</h2>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartProduct key={item.id} cartItem={item} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
