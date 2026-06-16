import { NextResponse } from "next/server";
import {db} from "@/lib/db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import base64url from "base64url";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function PUT(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();

    const { email } = forgotPasswordSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // generate reset token
    const rawToken = uuidv4();
    const token = base64url.encode(rawToken);

    const tokenExpiry = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    await db.user.update({
      where: { email },
      data: {
        verificationToken: token,
      },
    });

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?id=${existingUser.id}&token=${token}`;

    await resend.emails.send({
      from: "Desishub <info@jazzafricaadventures.com>",
      to: email,
      subject: "Password Reset - Limi Ecommerce",
      react: await EmailTemplate({
        name: existingUser.name ?? "User",
        redirectUrl,
        linkText: "Reset Password",
        description:
          "Click the button below to reset your password. This link expires in 15 minutes.",
        subject: "Password Reset",
      }),
    });

    return NextResponse.json({
      message: "Password reset email sent",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
