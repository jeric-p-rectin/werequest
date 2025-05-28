import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    const resident = await db.collection("users").findOne(
      { _id: new ObjectId(id as string) }
    );

    if (!resident) {
      return NextResponse.json(
        { error: 'Resident not found' },
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, ...safeResident } = resident;

    return NextResponse.json(safeResident);
  } catch (error) {
    console.error('Error fetching resident:', error);
    return NextResponse.json(
      { error: 'Error fetching resident details' },
      { status: 500 }
    );
  }
} 