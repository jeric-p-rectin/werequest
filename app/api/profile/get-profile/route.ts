import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(session.user.id) },
      {
        projection: {
          password: 0, // Exclude password from the response
        }
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
