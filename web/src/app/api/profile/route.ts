import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail, sendProfileUpdatedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't return password
    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.password;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      name,
      email,
      phone,
      avatar,
      currentPassword,
      newPassword,
      // Agent-only profile fields
      bio,
      agency,
      licenseNumber,
      yearsExp
    } = body;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. If updating email, check uniqueness
    if (email && email !== user.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
      }
    }

    // 2. Handle password update if requested
    let updatedPasswordHash: string | undefined = undefined;
    if (currentPassword && newPassword) {
      if (!user.password) {
        return NextResponse.json({ error: "No password set for OAuth users" }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      updatedPasswordHash = await bcrypt.hash(newPassword, 10);
    }

    // 3. Update User table
    await db.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        password: updatedPasswordHash
      }
    });

    // 4. Update Profile table if they have one or if they are AGENT
    if (user.role === "AGENT" && (bio !== undefined || agency !== undefined || licenseNumber !== undefined || yearsExp !== undefined)) {
      await db.profile.upsert({
        where: { userId },
        create: {
          userId,
          bio: bio || null,
          agency: agency || null,
          licenseNumber: licenseNumber || null,
          yearsExp: yearsExp ? parseInt(yearsExp) : 0
        },
        update: {
          bio: bio !== undefined ? bio : undefined,
          agency: agency !== undefined ? agency : undefined,
          licenseNumber: licenseNumber !== undefined ? licenseNumber : undefined,
          yearsExp: yearsExp !== undefined ? parseInt(yearsExp) : undefined
        }
      });
    }

    // 5. Send profile/credentials update email alert
    try {
      const updatedFields: string[] = [];
      if (name !== undefined && name !== user.name) updatedFields.push("Name");
      if (email !== undefined && email !== user.email) updatedFields.push("Email Address");
      if (phone !== undefined && phone !== user.phone) updatedFields.push("Phone Number");

      const targetEmail = (email && email !== user.email) ? email : user.email;

      if (updatedPasswordHash) {
        await sendPasswordChangedEmail(targetEmail, name || user.name);
      } else if (updatedFields.length > 0) {
        await sendProfileUpdatedEmail(targetEmail, name || user.name, updatedFields);
      }
    } catch (emailError) {
      console.error("Profile change notification email failed:", emailError);
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Support DELETE account in the Danger Zone
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
