import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required fields" },
        { status: 400 }
      );
    }

    // Verify role matches enum
    const validRoles = [Role.BUYER, Role.AGENT];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected. Must be BUYER or AGENT." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile conditionally if they are an agent
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role as Role,
        // If they are an Agent, create an empty Profile
        profile: role === Role.AGENT ? {
          create: {
            bio: "",
            agency: "",
            licenseNumber: "",
            yearsExp: 0,
            verified: false,
          }
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      }
    });

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Welcome email failed to send:", emailError);
    }

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "An error occurred during registration";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
