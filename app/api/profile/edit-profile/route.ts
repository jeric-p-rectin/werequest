import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

interface UpdateFields {
  // Account
  username?: string;
  email: string;
  password?: string;
  
  // Personal Information
  firstName?: string;
  middleName?: string;
  lastName?: string;
  extName?: string;
  fullName?: string;
  birthday?: string;
  birthPlace?: string;
  age?: number;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  religion?: string;
  
  // Contact & Address
  phoneNumber?: string;
  houseNo?: string;
  purok?: string;
  
  // Work & Status
  workingStatus?: string;
  sourceOfIncome?: string;
  votingStatus?: string;
  educationalAttainment?: string;
  
  // System
  updatedAt: Date;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super admin';
    const updateFields: UpdateFields = {
      // Account
      username: data.username,
      email: data.email,
      
      // Personal Information
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      extName: data.extName,
      fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      birthday: data.birthday,
      birthPlace: data.birthPlace,
      age: data.age,
      gender: data.gender,
      civilStatus: data.civilStatus,
      nationality: data.nationality || 'Filipino',
      religion: data.religion,
      
      // Contact & Address
      phoneNumber: data.phoneNumber,
      houseNo: data.houseNo,
      purok: data.purok,
      
      // Work & Status
      workingStatus: data.workingStatus,
      sourceOfIncome: data.sourceOfIncome,
      votingStatus: data.votingStatus,
      educationalAttainment: data.educationalAttainment,
      
      // System
      updatedAt: new Date()
    };

    // Only hash password if it's being updated (for admin users only)
    if (isAdmin && data.password) {
      updateFields.password = await hash(data.password, 10);
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    
    // Only check for duplicate email for all users
    const existingUser = await db.collection("users").findOne({
      _id: { $ne: new ObjectId(session.user.id) },
      email: data.email
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already in use'
        },
        { status: 400 }
      );
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateFields }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
