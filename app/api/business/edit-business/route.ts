import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ownerName, businessName, address, businessNature, dateEstablished } = body;

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    const collection = db.collection("business");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ownerName, businessName, address, businessNature, dateEstablished } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No business found to update" }, { status: 404 });
    }

    return NextResponse.json({ message: "Business updated successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update business" }, { status: 500 });
  }
}