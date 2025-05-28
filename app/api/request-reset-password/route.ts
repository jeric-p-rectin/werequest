import { NextResponse } from 'next/server';
import mongodb from '@/app/lib/mongodb';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const client = await mongodb;
    const db = client.db("WeRequestDB");
    
    // Check if user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user document
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // Create reset URL
    const resetUrl = `${process.env.MODE === 'development' ? process.env.DEVELOPMENT_URL : process.env.PRODUCTION_URL}/reset-password?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL,
      to: email,
      subject: 'Password Reset Request - Barangay San Andres',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4d5f30;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please click the link below to reset your password:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #80eb15; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <p>Best regards,<br>Barangay San Andres</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: "If this email exists, you will receive reset instructions." 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
