import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    const blotters = await db.collection('blotters').find({}).toArray();

    return NextResponse.json({ 
      success: true, 
      data: blotters 
    });
  } catch (error) {
    console.error('Error fetching blotters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blotters' },
      { status: 500 }
    );
  }
}
