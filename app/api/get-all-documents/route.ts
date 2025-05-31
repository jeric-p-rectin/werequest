import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Get all documents
    const documents = await db
      .collection("documents")
      .find({})
      .sort({ requestDate: -1 }) // Sort by request date, newest first
      .toArray();

    return NextResponse.json({
      message: "Documents fetched successfully",
      data: documents
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({
      message: "Error fetching documents",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
} 