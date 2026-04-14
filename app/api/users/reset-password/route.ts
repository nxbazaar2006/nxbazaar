import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

const resetPasswordSchema = z.object({
  id: z.string(),
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const { id, token, password } = resetPasswordSchema.parse(body);

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

    if (!user.verificationToken || user.verificationToken !== token) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid or expired reset link",
        },
        { status: 400 }
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        verificationToken: null,
      },
    });

    return NextResponse.json({
      data: updatedUser,
      message: "Password updated successfully",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to update password",
      },
      { status: 500 }
    );
  }
}
