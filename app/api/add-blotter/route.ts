import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['caseNo', 'complainant', 'respondent', 'complaint', 'natureOfComplaint'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          message: `Missing required field: ${field}`,
          error: "Validation Error (Missing required field)"
        }, { status: 400 });
      }
    }

    const complainantInformation = await db.collection("users").findOne({ fullName: body.complainant });
    const respondentInformation = await db.collection("users").findOne({ fullName: body.respondent });

    if (!complainantInformation || !respondentInformation) {
      return NextResponse.json({
        message: "Complainant or respondent not found",
        error: "Validation Error (Complainant or Respondent not found)"
      }, { status: 400 });
    }

    // Create blotter document
    const blotter = {
      caseNo: body.caseNo,
      complaint: body.complaint,
      natureOfComplaint: body.natureOfComplaint,
      complainantInfo: complainantInformation,
      respondentInfo: respondentInformation,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    const result = await db.collection("blotters").insertOne(blotter);

    if (!result.insertedId) {
      throw new Error("Failed to insert blotter");
    }

    return NextResponse.json({
      message: "Blotter created successfully",
      data: {
        _id: result.insertedId,
        ...blotter
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blotter:', error);
    return NextResponse.json({
      message: "Error creating blotter",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}