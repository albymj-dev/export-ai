import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RiskEngine } from '@/lib/verification/risk-engine';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    const shipment = await db.getShipmentById(shipmentId);
    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const docs = await db.getDocuments(shipmentId);
    const discrepancies = await db.getDiscrepancies(shipmentId);
    const checklist = await db.getChecklist(shipmentId);
    const riskAnalysis = RiskEngine.calculateShipmentRisk(docs, discrepancies);
    const { readiness } = RiskEngine.calculateExportReadiness(docs, discrepancies);
    const auditLogs = await db.getAuditLogs(shipmentId);

    const reportData = {
      title: 'EXPORTAI Official Pre-Shipment Verification Certificate & Audit Dossier',
      generatedAt: new Date().toISOString(),
      verifiedBy: 'Kerala Export Inspection Council / EXPORTAI Platform',
      shipment: {
        id: shipment.id,
        reference: shipment.shipmentReference,
        exporter: shipment.exporter,
        buyer: shipment.buyer,
        consignee: shipment.consignee,
        portOfLoading: shipment.portOfLoading,
        portOfDischarge: shipment.portOfDischarge,
        shipmentDate: shipment.shipmentDate,
        incoterms: shipment.incoterms,
        currency: shipment.currency,
      },
      verificationMetrics: {
        riskScore: riskAnalysis.score,
        riskTier: riskAnalysis.tier,
        exportReadinessScore: readiness.score,
        exportReadinessStatus: readiness.status,
        totalDocuments: docs.length,
        totalDiscrepancies: discrepancies.length,
        criticalDiscrepancies: discrepancies.filter((d) => d.severity === 'CRITICAL').length,
      },
      documents: docs.map((d) => ({
        id: d.id,
        type: d.documentType,
        name: d.originalName,
        extractionStatus: d.extractionStatus,
      })),
      discrepancies: discrepancies.map((d) => ({
        field: d.field,
        category: d.category,
        severity: d.severity,
        docA: d.docAName,
        valueA: d.valueA,
        docB: d.docBName,
        valueB: d.valueB,
        difference: d.difference,
        status: d.status,
        resolution: d.humanResolution || null,
      })),
      aiSummary: shipment.aiSummary || null,
      auditTrail: auditLogs.slice(0, 20),
    };

    if (format === 'csv') {
      const headers = ['Field', 'Category', 'Severity', 'Document A', 'Value A', 'Document B', 'Value B', 'Difference', 'Status'];
      const rows = discrepancies.map((d) => [
        `"${d.field.replace(/"/g, '""')}"`,
        `"${d.category}"`,
        `"${d.severity}"`,
        `"${d.docAName.replace(/"/g, '""')}"`,
        `"${String(d.valueA).replace(/"/g, '""')}"`,
        `"${d.docBName.replace(/"/g, '""')}"`,
        `"${String(d.valueB).replace(/"/g, '""')}"`,
        `"${d.difference.replace(/"/g, '""')}"`,
        `"${d.status}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${shipment.shipmentReference}_verification_discrepancies.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
