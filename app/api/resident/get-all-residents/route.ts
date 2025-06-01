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

    // Remove sensitive information
    const sanitizedResidents = residents.map(resident => {
      const { password, ...userWithoutPassword } = resident;
      return userWithoutPassword;
    });

    return NextResponse.json({
      message: "Residents fetched successfully",
      data: sanitizedResidents
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching residents:', error);
    return NextResponse.json({
      message: "Error fetching residents",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
