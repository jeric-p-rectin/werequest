import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    // Check if document is verified first
    const document = await db.collection('documents').findOne(
      { _id: new ObjectId(params.id) }
    );

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!document.verify?.status) {
      return NextResponse.json(
        { success: false, error: 'Document must be verified before approval' },
        { status: 400 }
      );
    }

    const result = await db.collection('documents').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          'approved.status': true,
          'approved.approvedBy': session.user.email,
          'approved.approvedAt': new Date(),
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
    console.error('Error approving document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to approve document' },
      { status: 500 }
    );
  }
} 