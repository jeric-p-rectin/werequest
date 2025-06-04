import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

interface UserDocument {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  fullName: string;
  birthday: Date;
  birthPlace: string;
  age: number;
  gender: string;
  civilStatus: string;
  nationality: string;
  religion: string;
  email: string;
  phoneNumber: string;
  houseNo: string;
  purok: string;
  workingStatus: string;
  sourceOfIncome: string;
  votingStatus: string;
  educationalAttainment: string;
  soloParent: boolean;
  fourPsBeneficiary: boolean;
  pwd: boolean;
  pwdType: string | null;
  role: string;
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    const { requests } = await request.json();

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({
        message: "Missing requests array",
        error: "At least one request is required"
      }, { status: 400 });
    }

    const requestIds: string[] = [];
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < requests.length; i++) {
      const { fullName, documentType, copies, purpose } = requests[i];
      if (!fullName || !documentType || !copies || !purpose) {
        errors.push({ index: i, error: "All fields are required" });
        continue;
      }

      const getRequestorInformation = await db.collection("users").findOne({ fullName: fullName }) as UserDocument | null;
      if (!getRequestorInformation) {
        errors.push({ index: i, error: "No resident found with the provided name" });
        continue;
      }

      // Generate a unique requestId
      const date = new Date();
      const requestId = `DOC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6)}`;

      requestIds.push(requestId);
    }

    return NextResponse.json({
      message: "Document requests processed",
      requestIds,
      errors
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating document request:', error);
    return NextResponse.json({
      message: "Error creating document request",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}