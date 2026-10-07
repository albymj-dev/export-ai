import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RiskEngine } from '@/lib/verification/risk-engine';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string; discrepancyId: string }> }
) {
  try {
    const { shipmentId, discrepancyId } = await params;
    const body = await req.json();
    const { action, verifiedValue, reason, reviewerName } = body;

    const discrepancies = await db.getDiscrepancies(shipmentId);
    const target = discrepancies.find((d) => d.id === discrepancyId);

    if (!target) {
      return NextResponse.json({ error: 'Discrepancy not found' }, { status: 404 });
    }

    let nextStatus: any = 'RESOLVED';
    if (action === 'REJECT_MISMATCH') nextStatus = 'REJECTED';
    else if (action === 'VERIFY_ACCEPTED') nextStatus = 'VERIFIED';
    else if (action === 'OPEN') nextStatus = 'OPEN';

    const resolution = {
      verifiedValue: verifiedValue ?? target.valueA,
      resolvedBy: reviewerName || 'Alby Mathew Joshy',
      resolvedAt: new Date().toISOString(),
      reason: reason || 'Human officer verified against source evidence.',
      action,
    };

    const updated = await db.updateDiscrepancy(discrepancyId, {
      status: nextStatus,
      humanResolution: resolution,
    });

    // Re-evaluate risk and readiness
    const docs = await db.getDocuments(shipmentId);
    const updatedDiscrepancies = await db.getDiscrepancies(shipmentId);
    const riskAnalysis = RiskEngine.calculateShipmentRisk(docs, updatedDiscrepancies);
    const { readiness, checklist } = RiskEngine.calculateExportReadiness(docs, updatedDiscrepancies);
    await db.setChecklist(shipmentId, checklist);

    const criticalCount = updatedDiscrepancies.filter(
      (d) => d.severity === 'CRITICAL' && (d.status === 'OPEN' || d.status === 'IN_REVIEW')
    ).length;

    await db.updateShipment(shipmentId, {
      riskScore: riskAnalysis.score,
      riskTier: riskAnalysis.tier,
      exportReadinessScore: readiness.score,
      exportReadinessStatus: readiness.status,
      criticalDiscrepancies: criticalCount,
      status: readiness.status === 'EXPORT_READY' ? 'EXPORT_READY' : 'NEEDS_REVIEW',
    });

    // Preserve audit log
    await db.logAudit({
      shipmentId,
      userId: 'user_officer_kerala',
      userName: reviewerName || 'Alby Mathew Joshy',
      action: `DISCREPANCY_${nextStatus}`,
      resourceType: 'DISCREPANCY',
      resourceId: discrepancyId,
      previousValue: { status: target.status, valueA: target.valueA, valueB: target.valueB },
      newValue: { status: nextStatus, resolution },
    });

    return NextResponse.json({
      discrepancy: updated,
      riskAnalysis,
      readiness,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update discrepancy' }, { status: 500 });
  }
}
