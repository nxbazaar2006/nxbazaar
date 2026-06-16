"use server";

import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators/checkoutSchema";
import { auth } from "@/auth";

export async function createOrder(data: unknown) {
  const validated = checkoutSchema.parse(data);
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const [firstName, ...lastNameParts] = validated.name.trim().split(/\s+/);

  const order = await db.order.create({
    data: {
      userId,
      orderNumber: `ORD-${Date.now()}`,
      firstName,
      lastName: lastNameParts.join(" ") || firstName,
      email: validated.email,
      phone: validated.phone,
      streetAddress: validated.address,
      city: validated.city,
      state: validated.state,
      zip: validated.zipCode,
      paymentMethod: validated.paymentMethod,
    },
  });

  return order;
}
