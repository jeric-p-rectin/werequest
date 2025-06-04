import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing announcement id.' }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db('WeRequestDB');
    const collection = db.collection('announcements');
    const result = await collection.deleteOne({ _id: new ObjectId(String(id)) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Announcement not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Announcement deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
