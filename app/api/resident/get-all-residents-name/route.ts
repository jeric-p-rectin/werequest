import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB"); // Make sure this matches your database name
    
    // Get all users with role "resident"
    const residents = await db
      .collection("users")
      .find({ role: "resident" })
      .toArray();

    // Extract only the fullName property from each resident
    const residentNames = residents.map(resident => ({
      fullName: resident.fullName,
      _id: resident._id
    }));

    return NextResponse.json({
      message: "Residents fetched successfully",
      data: residentNames
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({
      message: "Error fetching residents",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}