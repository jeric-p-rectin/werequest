import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest } from 'next/server';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const client = await clientPromise;
    const db = client.db("WeRequestDB");

    // Helper to sanitize user (remove password)
    const sanitizeUser = (user: Record<string, unknown> | null): Record<string, unknown> | null => {
      if (!user) return null;
      const { ...rest } = user;
      return rest;
    };

    // Process parties helper (complainants/respondents)
    const processParties = async (
      parties: PartyInput[] | undefined,
      sideLabel: string
    ): Promise<{ processed?: ProcessedParty[]; error?: string }> => {
      if (!Array.isArray(parties)) {
        return { processed: undefined };
      }

      const processed: ProcessedParty[] = [];

      for (let i = 0; i < parties.length; i++) {
        const p = parties[i];
        if (!p || !p.type || !p.name) {
          return { error: `Invalid party at index ${i} for ${sideLabel}. 'type' and 'name' are required.` };
        }

        if (p.type === 'Resident') {
          let resident: Record<string, unknown> | null = null;

          // Try by residentId if provided
          if (p.residentId) {
            try {
              resident = await db.collection("users").findOne({ _id: new ObjectId(p.residentId) }) as Record<string, unknown> | null;
            } catch {
              // invalid ObjectId format
              return { error: `Invalid residentId for ${sideLabel} at index ${i}` };
            }
          }

          // Fallback to matching by fullName if not found by id
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

    // If complainants/respondents present, validate & process them
    if (Object.prototype.hasOwnProperty.call(updateData, 'complainants')) {
      const result = await processParties(updateData.complainants as PartyInput[], 'complainants');
      if (result.error) {
        return NextResponse.json({ message: result.error, error: "Validation Error" }, { status: 400 });
      }
      updateData.complainants = result.processed;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'respondents')) {
      const result = await processParties(updateData.respondents as PartyInput[], 'respondents');
      if (result.error) {
        return NextResponse.json({ message: result.error, error: "Validation Error" }, { status: 400 });
      }
      updateData.respondents = result.processed;
    }

    // Remove _id from updateData to avoid modifying immutable field
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _, ...cleanUpdateData } = updateData;

    // Remove any undefined or null values from the update (top-level keys)
    Object.keys(cleanUpdateData).forEach(key =>
      (cleanUpdateData[key] === undefined || cleanUpdateData[key] === null) && delete cleanUpdateData[key]
    );

    const result = await db.collection('blotters').updateOne(
      { _id: new ObjectId(id) },
      { $set: cleanUpdateData }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { success: false, error: 'Blotter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blotter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blotter' },
      { status: 500 }
    );
  }
}