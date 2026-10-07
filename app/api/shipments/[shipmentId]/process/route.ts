import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ComparisonEngine } from '@/lib/verification/comparison-engine';
import { RiskEngine } from '@/lib/verification/risk-engine';

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

    const docs = await db.getDocuments(shipmentId);
    const compResult = ComparisonEngine.runCrossCheck(shipmentId, docs);
    await db.setDiscrepancies(shipmentId, compResult.discrepancies);

    const riskAnalysis = RiskEngine.calculateShipmentRisk(docs, compResult.discrepancies);
    const { readiness, checklist } = RiskEngine.calculateExportReadiness(docs, compResult.discrepancies);
    await db.setChecklist(shipmentId, checklist);

    const criticalCount = compResult.discrepancies.filter((d) => d.severity === 'CRITICAL').length;
    const updated = await db.updateShipment(shipmentId, {
      riskScore: riskAnalysis.score,
      riskTier: riskAnalysis.tier,
      exportReadinessScore: readiness.score,
      exportReadinessStatus: readiness.status,
      discrepancyCount: compResult.discrepancies.length,
      criticalDiscrepancies: criticalCount,
      status: compResult.discrepancies.length === 0 ? 'EXPORT_READY' : 'NEEDS_REVIEW',
    });

    await db.logAudit({
      shipmentId,
      userId: 'user_officer_kerala',
      userName: 'EXPORTAI Engine',
      action: 'REPROCESS_CROSS_CHECK',
      resourceType: 'SHIPMENT',
      resourceId: shipmentId,
      newValue: { discrepancies: compResult.discrepancies.length, risk: riskAnalysis.score },
    });

    return NextResponse.json({
      shipment: updated,
      discrepancies: compResult.discrepancies,
      riskAnalysis,
      readiness,
      checklist,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
