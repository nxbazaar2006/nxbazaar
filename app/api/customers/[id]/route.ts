import { NextResponse } from "next/server";
import {db} from "@/lib/db";
import { customerSchema } from "@/lib/validators/customer.schema";
import { Prisma } from "@prisma/client";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = customerSchema.parse(await request.json());

    if (!id) {
      return NextResponse.json(
        { message: "Customer ID missing" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      username,
      phone,
      firstName,
      lastName,
      dateOfBirth,
      streetAddress,
      city,
      district,
      country,
      profileImage,
    } = body;
    const profileData: Prisma.UserProfileCreateWithoutUserInput & Prisma.UserProfileUpdateWithoutUserInput = {
      username,
      phone,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      streetAddress,
      city,
      district,
      country,
      profileImage,
    };

    const customer = await db.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        profile: {
          upsert: {
            create: profileData,
            update: profileData,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Customer ID missing" },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
