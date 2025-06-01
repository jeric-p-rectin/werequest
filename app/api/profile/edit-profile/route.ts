import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

interface UpdateFields {
  username: string;
  email: string;
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
    
    // Build update fields object
    const updateFields: UpdateFields = {
      username: data.username,
      email: data.email,
      updatedAt: new Date()
    };

    // Only hash and update password if provided
    if (data.password) {
      updateFields.password = await hash(data.password, 10);
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Check if username or email is already taken
    const existingUser = await db.collection("users").findOne({
      _id: { $ne: new ObjectId(session.user.id) },
      $or: [
        { username: data.username },
        { email: data.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: existingUser.username === data.username 
            ? 'Username is already taken' 
            : 'Email is already in use'
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
