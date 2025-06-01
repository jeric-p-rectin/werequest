import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

interface UpdateFields {
  email: string;
  phoneNumber?: string;
  civilStatus?: string;
  workingStatus?: string;
  password?: string;
  updatedAt: Date;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Determine allowed fields based on role
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super admin';
    const updateFields: UpdateFields = {
      email: data.email,
      updatedAt: new Date()
    };
    if (isAdmin) {
      // Admins can update password
      if (data.password) {
        updateFields.password = await hash(data.password, 10);
      }
    } else {
      // Residents can update phoneNumber, civilStatus, workingStatus
      updateFields.phoneNumber = data.phoneNumber;
      updateFields.civilStatus = data.civilStatus;
      updateFields.workingStatus = data.workingStatus;
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Only check for duplicate email for all users
    const existingUser = await db.collection("users").findOne({
      _id: { $ne: new ObjectId(session.user.id) },
      email: data.email
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already in use'
        },
        { status: 400 }
      );
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateFields }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
