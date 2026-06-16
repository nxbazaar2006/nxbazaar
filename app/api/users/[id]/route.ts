import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const idSchema = z.string().min(1);

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET USER
export async function GET(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
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

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// DELETE USER
export async function DELETE(
  req: Request,
  { params }: RouteParams
) {
  try {
    const { id: rawId } = await params;
    const id = idSchema.parse(rawId);

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const deletedUser = await db.user.delete({
      where: { id },
    });

    return NextResponse.json({
      data: deletedUser,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
