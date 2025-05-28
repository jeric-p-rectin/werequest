import { NextResponse } from 'next/server';
import mongodb from '@/app/lib/mongodb';
import { hash } from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    const client = await mongodb;
    const db = client.db("WeRequestDB");
    
    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password and remove reset token
    await db.collection("users").updateOne(
      { resetToken: token },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    return NextResponse.json({ 
      message: "Password has been reset successfully" 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}
