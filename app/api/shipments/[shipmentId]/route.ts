import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RiskEngine } from '@/lib/verification/risk-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const shipment = await db.getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const documents = await db.getDocuments(shipmentId);
    const discrepancies = await db.getDiscrepancies(shipmentId);
    let checklist = await db.getChecklist(shipmentId);
    const riskAnalysis = RiskEngine.calculateShipmentRisk(documents, discrepancies);
    const { readiness, checklist: calculatedChecklist } = RiskEngine.calculateExportReadiness(documents, discrepancies);

    if (!checklist || checklist.length === 0) {
      checklist = calculatedChecklist;
      await db.setChecklist(shipmentId, calculatedChecklist);
    }
    const auditLogs = await db.getAuditLogs(shipmentId);

    return NextResponse.json({
      shipment,
      documents,
      discrepancies,
      checklist,
      riskAnalysis,
      readiness,
      auditLogs,
    });
  } catch (error: any) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch shipment' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const body = await req.json();
    const updated = await db.updateShipment(shipmentId, body);
    if (!updated) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    await db.logAudit({
      shipmentId,
      userId: 'user_officer_kerala',
      userName: 'Verification Officer',
      action: 'SHIPMENT_UPDATED',
      resourceType: 'SHIPMENT',
      resourceId: shipmentId,
      newValue: body,
    });

    return NextResponse.json({ shipment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    await db.deleteShipment(shipmentId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete shipment' }, { status: 500 });
  }
}
