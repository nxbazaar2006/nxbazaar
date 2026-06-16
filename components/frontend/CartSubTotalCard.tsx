import Link from "next/link";

type Props = {
  subTotal: number;
};

export default function CartSubTotalCard({ subTotal }: Props) {
  const shipping = 10;
  const tax = 0;

  const totalPrice =
    Number(subTotal || 0) + Number(shipping) + Number(tax);

  return (
    <div
      className="
        neumorphic-card col-span-full rounded-3xl
        p-5
        md:col-span-4
      "
    >
      <h2 className="text-foreground border-b border-white/10 pb-3 text-2xl font-semibold tracking-tight">
        Cart Summary
      </h2>

      <p className="py-5 text-sm text-muted-foreground">
        Add your shipping address at checkout
      </p>

      <div className="space-y-3 border-b border-white/10 pb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">₹{Number(subTotal || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">₹{shipping.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">₹{tax.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-between py-5 text-lg font-bold">
        <span>Total</span>
        <span>₹{totalPrice.toFixed(2)}</span>
      </div>

      <Link
        href="/checkout"
        className="
          soft-button w-full rounded-2xl
          py-3 text-center font-semibold
        "
      >
        Continue to Checkout
      </Link>
    </div>
  );
}
