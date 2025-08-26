import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

type PartyInput = {
  type: 'Resident' | 'Non-Resident';
  name: string;
  residentId?: string | null;
};

type ProcessedParty = {
  type: 'Resident' | 'Non-Resident';
  name: string;
  residentId?: unknown;
  residentInfo?: Record<string, unknown> | null;
};

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    const body = await request.json();

    // Basic validation
    if (!body.caseNo) {
      return NextResponse.json({ message: "Missing required field: caseNo", error: "Validation Error" }, { status: 400 });
    }
    if (!body.complaint) {
      return NextResponse.json({ message: "Missing required field: complaint", error: "Validation Error" }, { status: 400 });
    }
    if (!body.natureOfComplaint) {
      return NextResponse.json({ message: "Missing required field: natureOfComplaint", error: "Validation Error" }, { status: 400 });
    }
    if (!Array.isArray(body.complainants) || body.complainants.length === 0) {
      return NextResponse.json({ message: "At least one complainant is required", error: "Validation Error" }, { status: 400 });
    }
    if (!Array.isArray(body.respondents) || body.respondents.length === 0) {
      return NextResponse.json({ message: "At least one respondent is required", error: "Validation Error" }, { status: 400 });
    }

    // Helper to sanitize user (remove password)
    const sanitizeUser = (user: Record<string, unknown> | null): Record<string, unknown> | null => {
      if (!user) return null;
      const { ...rest } = user;
      return rest;
    };

    // Process parties (complainants/respondents)
    const processParties = async (
      parties: PartyInput[],
      sideLabel: string
    ): Promise<{ processed?: ProcessedParty[]; error?: string }> => {
      const processed: ProcessedParty[] = [];

      for (let i = 0; i < parties.length; i++) {
        const p = parties[i];
        if (!p || !p.type || !p.name) {
          return { error: `Invalid party at index ${i} for ${sideLabel}. 'type' and 'name' are required.` };
        }

        if (p.type === 'Resident') {
          let resident: Record<string, unknown> | null = null;

          // Prefer residentId if provided
          if (p.residentId) {
            try {
              resident = await db.collection("users").findOne({ _id: new ObjectId(p.residentId) }) as Record<string, unknown> | null;
            } catch {
              // invalid ObjectId format
              return { error: `Invalid residentId for ${sideLabel} at index ${i}` };
            }
          }

          // Fallback to matching by fullName if resident not found via id
          if (!resident) {
            resident = await db.collection("users").findOne({ fullName: p.name }) as Record<string, unknown> | null;
          }

          if (!resident) {
            return { error: `Resident not found for ${sideLabel} at index ${i} (searched name/id)` };
          }

          processed.push({
            type: 'Resident',
            name: (resident.fullName as string) || p.name,
            residentId: resident._id,
            residentInfo: sanitizeUser(resident)
          });
        } else {
          // Non-Resident: accept manual name
          processed.push({
            type: 'Non-Resident',
            name: p.name,
            residentId: undefined
          });
        }
      }

      return { processed };
    };

    const processedComplainantsResult = await processParties(body.complainants as PartyInput[], 'complainants');
    if (processedComplainantsResult.error) {
      return NextResponse.json({ message: processedComplainantsResult.error, error: "Validation Error" }, { status: 400 });
    }

    const processedRespondentsResult = await processParties(body.respondents as PartyInput[], 'respondents');
    if (processedRespondentsResult.error) {
      return NextResponse.json({ message: processedRespondentsResult.error, error: "Validation Error" }, { status: 400 });
    }

    const complainants = processedComplainantsResult.processed!;
    const respondents = processedRespondentsResult.processed!;

    // Create blotter document
    const blotter = {
      caseNo: body.caseNo,
      complaint: body.complaint,
      natureOfComplaint: body.natureOfComplaint,
      complainants,
      respondents,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

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