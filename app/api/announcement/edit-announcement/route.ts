import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id.' }, { status: 400 });
    }
    updateFields.dateUpdated = new Date();

    const client = await clientPromise;
    const db = client.db('WeRequestDB');
    const collection = db.collection('announcements');

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(String(id)) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      // Double-check if the document exists after update
      const updatedDoc = await collection.findOne({ _id: new ObjectId(String(id)) });
      if (updatedDoc) {
        return NextResponse.json(updatedDoc, { status: 200 });
      }
      return NextResponse.json({ error: 'Announcement not found.' }, { status: 404 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
