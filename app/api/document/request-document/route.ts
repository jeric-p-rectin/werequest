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

interface DocumentRequest {
  requestedFor: string;
  fullName: string;
  documentType: string;
  copies: number;
  purpose: string;
  proofOfAuthority?: string | null;
  proofOfAuthorityName?: string | null;
  proofOfAuthoritySize?: number | null;
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

    // Validate maximum number of requests (5)
    if (requests.length > 5) {
      return NextResponse.json({
        message: "Too many requests",
        error: "Maximum of 5 document requests allowed per submission"
      }, { status: 400 });
    }

    const requestIds: string[] = [];
    const errors: { index: number; error: string }[] = [];

    for (let i = 0; i < requests.length; i++) {
      const request: DocumentRequest = requests[i];
      
      // Validate required fields
      if (!request.requestedFor || !request.fullName || !request.documentType || !request.copies || !request.purpose) {
        errors.push({ index: i, error: "All fields are required" });
        continue;
      }

      // Validate requestedFor values
      if (!['For Myself', 'For Others'].includes(request.requestedFor)) {
        errors.push({ index: i, error: "Invalid requestedFor value" });
        continue;
      }

      // Validate copies
      if (request.copies < 1 || request.copies > 3) {
        errors.push({ index: i, error: "Copies must be between 1 and 3" });
        continue;
      }

      // Validate document types
      const validDocumentTypes = [
        'Barangay Clearance',
        'Certificate of Indigency',
        'Certificate of Residency',
        'Business Permit',
        'Barc Certificate'
      ];
      if (!validDocumentTypes.includes(request.documentType)) {
        errors.push({ index: i, error: "Invalid document type" });
        continue;
      }

      // Validate purposes
      const validPurposes = ['Employment', 'Scholarship', 'Medical'];
      if (!validPurposes.includes(request.purpose)) {
        errors.push({ index: i, error: "Invalid purpose" });
        continue;
      }

      // Check if resident exists in database
      const getRequestorInformation = await db.collection("users").findOne({ fullName: request.fullName }) as UserDocument | null;
      if (!getRequestorInformation) {
        errors.push({ index: i, error: "No resident found with the provided name" });
        continue;
      }

      // Prepare dates
      const date = new Date();
      const dateOnly = date.toISOString().split("T")[0];

      // Check if a folderId already exists for this user on this date
      let folderId: string;
      const existingDoc = await db.collection("documents").findOne({
        "requestorInformation._id": getRequestorInformation._id,
        folderId: { $regex: `^${getRequestorInformation._id}_${dateOnly}$` }
      });

      if (existingDoc) {
        folderId = existingDoc.folderId; // reuse existing folderId for same day
      } else {
        folderId = `${getRequestorInformation._id}_${dateOnly}`;
      }

      // Generate a unique requestId
      const requestId = `DOC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6)}`;

      // Create document request record
      const documentRequest = {
        requestId,
        folderId, // <-- NEW
        requestorInformation: {
          firstName: getRequestorInformation.firstName,
          middleName: getRequestorInformation.middleName,
          lastName: getRequestorInformation.lastName,
          extName: getRequestorInformation.extName,
          fullName: getRequestorInformation.fullName,
          birthday: getRequestorInformation.birthday,
          birthPlace: getRequestorInformation.birthPlace,
          age: getRequestorInformation.age,
          gender: getRequestorInformation.gender,
          civilStatus: getRequestorInformation.civilStatus,
          nationality: getRequestorInformation.nationality,
          religion: getRequestorInformation.religion,
          email: getRequestorInformation.email,
          phoneNumber: getRequestorInformation.phoneNumber,
          houseNo: getRequestorInformation.houseNo,
          purok: getRequestorInformation.purok,
          workingStatus: getRequestorInformation.workingStatus,
          sourceOfIncome: getRequestorInformation.sourceOfIncome,
          votingStatus: getRequestorInformation.votingStatus,
          educationalAttainment: getRequestorInformation.educationalAttainment,
          soloParent: getRequestorInformation.soloParent,
          fourPsBeneficiary: getRequestorInformation.fourPsBeneficiary,
          pwd: getRequestorInformation.pwd,
          pwdType: getRequestorInformation.pwdType,
          role: getRequestorInformation.role,
          _id: getRequestorInformation._id
        },
        documentType: request.documentType,
        copies: request.copies,
        purpose: request.purpose,
        proofOfAuthority: request.proofOfAuthority || null,
        proofOfAuthorityName: request.proofOfAuthorityName || null,
        proofOfAuthoritySize: request.proofOfAuthoritySize || null,
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
        },
        approved: {
          status: false,
          approvedBy: null,
          approvedAt: null,
        },
        createdAt: date,
        updatedAt: date
      };

      // Insert into database
      await db.collection("documents").insertOne(documentRequest);
      
      requestIds.push(requestId);
    }

    // If there are any errors, return them along with successful requests
    if (errors.length > 0) {
      return NextResponse.json({
        message: "Document requests processed with some errors",
        requestIds,
        errors
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({
      message: "Document requests submitted successfully",
      requestIds
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating document request:', error);
    return NextResponse.json({
      message: "Error creating document request",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }, { status: 500 });
  }
}
