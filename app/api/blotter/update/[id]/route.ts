import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    // Remove _id from updateData to avoid modifying immutable field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _, ...cleanUpdateData } = updateData;

    // Remove any undefined or null values from the update
    Object.keys(cleanUpdateData).forEach(key => 
      (cleanUpdateData[key] === undefined || cleanUpdateData[key] === null) && delete cleanUpdateData[key]
    );

    const result = await db.collection('blotters').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: cleanUpdateData }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'Blotter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blotter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blotter' },
      { status: 500 }
    );
  }
} 