import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    const result = await db.collection('blotters').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'Blotter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blotter status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blotter status' },
      { status: 500 }
    );
  }
}
