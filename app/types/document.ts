import { ObjectId } from "mongodb";

export interface RequestedDocument {
  _id: ObjectId;
  
  // Request Information
  requestId: string;                 // Unique request identifier
  requestorInformation: {
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
    _id: string;
  };
  documentType: string;              // e.g., "Barangay Clearance", "Certificate of Residency", etc.
  purpose: string;                   // Purpose for requesting the document
  requestDate: Date;                 // When the request was made
  copies: number;                    // Number of copies requested
  
  // Document Status Properties
  decline: {
    status: boolean;                 // Whether document is declined
    reason?: string;                 // Reason for declining
    declinedBy?: string;            // Name of staff who declined
    declinedAt?: Date;              // When it was declined
  };
  
  verify: {
    status: boolean;                 // Whether document is verified
    verifiedBy?: string;            // Name of staff who verified
    verifiedAt?: Date;              // When it was verified
    remarks?: string;               // Any verification notes
  };
  
  approved: {
    status: boolean;                 // Whether document is approved
    approvedBy?: string;            // Name of staff who approved
    approvedAt?: Date;              // When it was approved
    documentNumber?: string;        // Document tracking number after approval
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
} 