import clientPromise from '../app/lib/mongodb';
import { ObjectId } from 'mongodb';

const DOCUMENT_TYPES = [
  'Barangay Clearance',
  'Certificate of Indigency',
  'Certificate of Residency',
  'Business Permit',
  'Barc Certificate',
] as const;
const PURPOSES = ['Employment', 'Scholarship', 'Medical'] as const;
const COPIES = [1, 2, 3] as const;

function randomFrom<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function randomPastDate() {
  // Random date in the last 5 years
  const now = new Date();
  const start = new Date(now.getFullYear() - 5, 0, 1);
  return randomDate(start, now);
}
function pad(n: number, width = 2) {
  return n.toString().padStart(width, '0');
}
function randomReason() {
  const reasons = [null, 'Incomplete requirements', 'Invalid ID', 'Incorrect information', 'Duplicate request', null, null];
  return randomFrom(reasons);
}

async function main() {
  const client = await clientPromise;
  const db = client.db('WeRequestDB');
  // Get only the 40 newly created residents (assume they have the same password)
  const newResidents = await db.collection('users').find({ password: "$2b$10$WFevh1ozem7Qs.dWD40v1.c4wZsY5Bk.VF6VLUTAilXbSKupRGioG" }).toArray();
  if (newResidents.length < 40) {
    throw new Error('Not enough new residents found. Please run generate-residents.ts first.');
  }
  // For each user, track which document types they've requested
  const userDocTypeMap: Record<string, Set<string>> = {};
  for (const user of newResidents) {
    userDocTypeMap[user._id.toString()] = new Set();
  }
  const documents = [];
  let docCount = 0;
  while (documents.length < 200) {
    // Pick a user
    const user = randomFrom(newResidents);
    const userId = user._id.toString();
    // Pick a document type the user hasn't requested yet
    const availableTypes = DOCUMENT_TYPES.filter(dt => !userDocTypeMap[userId].has(dt));
    if (availableTypes.length === 0) continue; // All types used for this user
    const documentType = randomFrom(availableTypes);
    userDocTypeMap[userId].add(documentType);
    // Generate document
    const requestDate = randomPastDate();
    const createdAt = new Date(requestDate.getTime() - Math.floor(Math.random() * 10000000));
    const updatedAt = new Date(requestDate.getTime() + Math.floor(Math.random() * 10000000));
    const declineStatus = Math.random() < 0.1;
    const verifyStatus = !declineStatus && Math.random() < 0.8;
    const approvedStatus = verifyStatus && Math.random() < 0.7;
    documents.push({
      _id: new ObjectId(),
      requestId: `DOC-${requestDate.getFullYear()}${pad(requestDate.getMonth() + 1)}${pad(requestDate.getDate())}-${Math.random().toString(36).slice(2, 8)}`,
      requestorInformation: {
        _id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        extName: user.extName,
        fullName: user.fullName,
        birthday: user.birthday,
        birthPlace: user.birthPlace,
        age: user.age,
        gender: user.gender === 'male' ? 'Male' : 'Female',
        civilStatus: user.civilStatus.charAt(0).toUpperCase() + user.civilStatus.slice(1),
        nationality: user.nationality,
        religion: user.religion,
        email: user.email,
        phoneNumber: user.phoneNumber,
        houseNo: user.houseNo,
        purok: user.purok,
        workingStatus: user.workingStatus,
        sourceOfIncome: user.sourceOfIncome,
        votingStatus: user.votingStatus === 'not-registered' ? 'not registered' : 'registered',
        educationalAttainment: user.educationalAttainment.charAt(0).toUpperCase() + user.educationalAttainment.slice(1),
        soloParent: user.soloParent,
        fourPsBeneficiary: user.fourPsBeneficiary,
        pwd: user.pwd,
        pwdType: user.pwdType,
        role: user.role,
      },
      documentType,
      copies: randomFrom(COPIES),
      purpose: randomFrom(PURPOSES),
      requestDate,
      decline: {
        status: declineStatus,
        reason: declineStatus ? randomReason() : null,
        declinedBy: declineStatus ? 'admin' : null,
        declinedAt: declineStatus ? new Date(requestDate.getTime() + 1000000) : null,
      },
      verify: {
        status: verifyStatus,
        verifiedBy: verifyStatus ? 'admin' : null,
        verifiedAt: verifyStatus ? new Date(requestDate.getTime() + 2000000) : null,
      },
      approved: {
        status: approvedStatus,
        approvedBy: approvedStatus ? 'admin' : null,
        approvedAt: approvedStatus ? new Date(requestDate.getTime() + 3000000) : null,
      },
      createdAt,
      updatedAt,
    });
    docCount++;
  }
  await db.collection('documents').insertMany(documents);
  console.log('Inserted', documents.length, 'documents.');
}

main().catch(console.error);
