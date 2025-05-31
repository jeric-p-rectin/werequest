import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Convert string ID to ObjectId
    const documentId = new ObjectId(params.id);

    // Update document to remove decline status
    const result = await db.collection("documents").updateOne(
      { _id: documentId },
      {
        $set: {
          decline: {
            status: false,
            reason: null,
            declinedBy: null,
            declinedAt: null
          },
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        message: "Document not found",
        error: "No document found with the provided ID"
      }, { status: 404 });
    }

    return NextResponse.json({
      message: "Document restored successfully"
    }, { status: 200 });

  } catch (error) {
    console.error('Error restoring document:', error);
    return NextResponse.json({
      message: "Error restoring document",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
} 