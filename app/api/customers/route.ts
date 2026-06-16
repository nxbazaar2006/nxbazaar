import {db} from "@/lib/db";
import { customerSchema, CustomerInput } from "@/lib/validators/customer.schema";
import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

function getCustomerProfileData(
  data: CustomerInput
): Prisma.UserProfileCreateWithoutUserInput {
  return {
    username: data.username,
    phone: data.phone,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    streetAddress: data.streetAddress,
    city: data.city,
    district: data.district,
    country: data.country,
    profileImage: data.profileImage,
  };
}

export async function GET() {
  try {
    const customers = await db.user.findMany({
      where: {
        role: UserRole.USER,
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
            streetAddress: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip: true,
            dateOfBirth: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = customerSchema.parse(await request.json());

    const customer = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: randomUUID(),
        role: UserRole.USER,
        profile: {
          create: getCustomerProfileData(body),
        },
      },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
            streetAddress: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip: true,
            dateOfBirth: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create customer" },
      { status: 500 }
    );
  }
}
