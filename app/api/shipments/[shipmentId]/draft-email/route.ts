import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GeminiService } from '@/lib/ai/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const { discrepancyId, recipientRole } = await req.json();

    const shipment = await db.getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const discrepancies = await db.getDiscrepancies(shipmentId);
    const target = discrepancies.find((d) => d.id === discrepancyId) || discrepancies[0];

    if (!target) {
      return NextResponse.json({ error: 'No discrepancy available to draft email' }, { status: 400 });
    }

    const draft = await GeminiService.draftDiscrepancyEmail(
      shipment,
      target,
      recipientRole || 'SUPPLIER'
    );

    await db.logAudit({
      shipmentId,
      userId: 'user_officer_kerala',
      userName: 'Alby Mathew Joshy',
      action: 'DRAFTED_DISCREPANCY_EMAIL',
      resourceType: 'DISCREPANCY',
      resourceId: target.id,
      newValue: { subject: draft.subject, recipient: draft.recipientRole },
    });

    return NextResponse.json({ draft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to draft email' }, { status: 500 });
  }
}
