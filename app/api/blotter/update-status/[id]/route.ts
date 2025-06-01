import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    const result = await db.collection('blotters').updateOne(
      { _id: new ObjectId(context.params.id) },
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
