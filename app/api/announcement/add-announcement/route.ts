import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, image, postedBy } = body;

    if (!title || !description || !image || !postedBy) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('WeRequestDB');
    const collection = db.collection('announcements');

    const now = new Date();
    const announcement = {
      title,
      description,
      image,
      postedBy,
      dateCreated: now,
      dateUpdated: now,
      // Add other fields as needed
    };

    const result = await collection.insertOne(announcement);

    return NextResponse.json({ message: 'Announcement added successfully', id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error adding announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
