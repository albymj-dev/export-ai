import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GeminiService } from '@/lib/ai/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const shipment = await db.getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const discrepancies = await db.getDiscrepancies(shipmentId);
    const summary = await GeminiService.generateExecutiveSummary(
      shipment,
      discrepancies,
      shipment.riskScore
    );

    const updated = await db.updateShipment(shipmentId, {
      aiSummary: {
        ...summary,
        generatedAt: new Date().toISOString(),
      },
    });

    await db.logAudit({
      shipmentId,
      userId: 'user_officer_kerala',
      userName: 'EXPORTAI Gemini Intelligence',
      action: 'GENERATED_EXECUTIVE_SUMMARY',
      resourceType: 'SHIPMENT',
      resourceId: shipmentId,
      newValue: { overview: summary.overview },
    });

    return NextResponse.json({ summary, shipment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 });
  }
}
