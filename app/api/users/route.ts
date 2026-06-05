import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import base64url from "base64url";
import { Resend } from "resend";
import EmailTemplate from "@/components/email-template";
import { registerSchema } from "@/lib/validators/registerSchema";
import { getErrorMessage } from "@/lib/error-message";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role, plan } = result.data;

    // CHECK EXISTING USER
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: `User with email (${email}) already exists`,
        },
        { status: 409 }
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // GENERATE TOKEN
    const rawToken = uuidv4();
    const token = base64url.encode(rawToken);

    // CREATE USER
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        plan,
        verificationToken: token,
      },
    });

    // SEND EMAIL IF SELLER
    if (role === "SELLER") {
      const userId = newUser.id;

      const linkText = "Verify Account";

      const redirectUrl = `onboarding/${userId}?token=${token}`;

      const description =
        "Thank you for creating an account. Click the link below to verify your account.";

      const subject = "Account Verification - Nxbazaar";

      const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: "rcvs.online@gmail.com",
        subject,
        react: EmailTemplate({
          name,
          redirectUrl,
          linkText,
          description,
          subject,
        }),
      });

      console.log("RESEND DATA:", data);
      console.log("RESEND ERROR:", error);
    }

    return NextResponse.json(
      {
        data: newUser,
        message: "User Created Successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      {
        message: getErrorMessage(error, "Server Error"),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
