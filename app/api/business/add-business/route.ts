import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ownerName, businessName, address, businessNature, dateEstablished } = body;

    if (!ownerName || !businessName || !address || !businessNature || !dateEstablished) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    const collection = db.collection("business");

    const newBusiness = { ownerName, businessName, address, businessNature, dateEstablished };
    const result = await collection.insertOne(newBusiness);

    return NextResponse.json({ message: "Business added", id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add business" }, { status: 500 });
  }
}