import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const id = await db.seedHackathonDemo(true);
    return NextResponse.json({ success: true, shipmentId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to seed demo data' }, { status: 500 });
  }
}
