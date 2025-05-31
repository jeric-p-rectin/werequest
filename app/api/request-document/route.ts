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
    
    const {fullName, documentType, copies, purpose} = await request.json();

    if (!fullName || !documentType || !copies || !purpose) {
      return NextResponse.json({
        message: "Missing required fields",
        error: "All fields are required"
      }, { status: 400 });
    }

    const getRequestorInformation = await db.collection("users").findOne({ fullName: fullName }) as UserDocument | null;

    if (!getRequestorInformation) {
      return NextResponse.json({
        message: "Requestor not found",
        error: "No resident found with the provided name"
      }, { status: 404 });
    }
    
    // Generate a unique requestId
    const date = new Date();
    const requestId = `DOC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6)}`;

    const documentRequest = {
      requestId,
      requestorInformation: {
        // Personal Information
        firstName: getRequestorInformation.firstName,
        middleName: getRequestorInformation.middleName,
        lastName: getRequestorInformation.lastName,
        extName: getRequestorInformation.extName,
        fullName: getRequestorInformation.fullName,

        // Birth Information
        birthday: getRequestorInformation.birthday,
        birthPlace: getRequestorInformation.birthPlace,
        age: getRequestorInformation.age,

        // Personal Details
        gender: getRequestorInformation.gender,
        civilStatus: getRequestorInformation.civilStatus,
        nationality: getRequestorInformation.nationality,
        religion: getRequestorInformation.religion,

        // Contact Information
        email: getRequestorInformation.email,
        phoneNumber: getRequestorInformation.phoneNumber,

        // Address
        houseNo: getRequestorInformation.houseNo,
        purok: getRequestorInformation.purok,

        // Work and Status
        workingStatus: getRequestorInformation.workingStatus,
        sourceOfIncome: getRequestorInformation.sourceOfIncome,

        // Additional Information
        votingStatus: getRequestorInformation.votingStatus,
        educationalAttainment: getRequestorInformation.educationalAttainment,

        // Status Information
        soloParent: getRequestorInformation.soloParent,
        fourPsBeneficiary: getRequestorInformation.fourPsBeneficiary,
        pwd: getRequestorInformation.pwd,
        pwdType: getRequestorInformation.pwdType,

        // System fields
        role: getRequestorInformation.role,
        _id: getRequestorInformation._id
      },
      documentType: documentType,
      copies: copies,
      purpose: purpose,
      requestDate: date,
      decline: {
        status: false,
        reason: null,
        declinedBy: null,
        declinedAt: null
      },
      verify: {
        status: false,
        verifiedBy: null,
        verifiedAt: null,
        remarks: null
      },
      approved: {
        status: false,
        approvedBy: null,
        approvedAt: null,
        documentNumber: null
      },
      createdAt: date,
      updatedAt: date
    };

    const result = await db.collection("documents").insertOne(documentRequest);

    return NextResponse.json({
      message: "Document request created successfully",
      requestId: requestId,
      _id: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating document request:', error);
    return NextResponse.json({
      message: "Error creating document request",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}