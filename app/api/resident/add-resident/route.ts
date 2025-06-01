import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { hash } from 'bcrypt';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Hash the password
    const hashedPassword = await hash(data.password, 10);

    // Create full name by combining name components
    const fullName = [
      data.firstName,
      data.middleName,
      data.lastName
    ].filter(Boolean).join(' ');

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Create new resident in database
    const result = await db.collection("users").insertOne({
      // Generate username
      username: `${data.firstName.slice(0, 3).toUpperCase()}${
        data.middleName ? data.middleName.slice(0, 2).toUpperCase() : 'XX'
      }${data.lastName.slice(0, 3).toUpperCase()}${
        new Date(data.birthday).getDate().toString().padStart(2, '0')
      }${new Date(data.birthday).getFullYear().toString().slice(-2)}`,

      // Personal Information
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      extName: data.extName,
      fullName: fullName,

      // Birth Information
      birthday: new Date(data.birthday),
      birthPlace: data.birthPlace,
      age: data.age, // Add age field

      // Personal Details
      gender: data.gender,
      civilStatus: data.civilStatus,
      nationality: data.nationality,
      religion: data.religion,

      // Contact Information
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,

      // Address
      houseNo: data.houseNo,
      purok: data.purok,

      // Work and Status
      workingStatus: data.workingStatus,
      sourceOfIncome: data.sourceOfIncome,

      // Additional Information
      votingStatus: data.votingStatus,
      educationalAttainment: data.educationalAttainment,

      // Status Information
      soloParent: data.soloParent === 'yes',
      fourPsBeneficiary: data.fourPsBeneficiary === 'yes',
      pwd: data.pwd === 'yes',
      pwdType: data.pwd === 'yes' ? data.pwdType : null,

      // System fields
      role: "resident",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      message: 'Resident created successfully',
      residentId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating resident:', error);
    return NextResponse.json(
      { error: 'Error creating resident' },
      { status: 500 }
    );
  }
}
