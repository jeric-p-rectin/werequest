import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    const result = await db.collection('documents').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          'verify.status': true,
          'verify.verifiedBy': session.user.email,
          'verify.verifiedAt': new Date(),
          'decline.status': false
        }
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify document' },
      { status: 500 }
    );
  }
} 