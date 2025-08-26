import { NextResponse } from 'next/server'
import client from '@/app/lib/mongodb'

export async function GET() {
  try {
    const dbClient = await client
    const businesses = await dbClient
      .db('WeRequestDB')
      .collection('business')
      .find({})
      .toArray()
    return NextResponse.json(businesses)
  } catch {
    return NextResponse.json({ error: 'Unable to fetch businesses' }, { status: 500 })
  }
}