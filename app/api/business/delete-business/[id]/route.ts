import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(request: Request, context: unknown) {
  const params = (context as { params?: { id?: string } } | undefined)?.params;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  // validate ObjectId
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("WeRequestDB");
    const collection = db.collection("business");

    const result = await collection.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Business deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete business error:", error);
    return NextResponse.json({ error: "Failed to delete business" }, { status: 500 });
  }
}