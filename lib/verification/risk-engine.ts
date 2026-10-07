import {
  DiscrepancyRecord,
  DocumentRecord,
  RiskAnalysis,
  RiskTier,
  ExportReadiness,
  ChecklistItem,
} from '@/types';

export class RiskEngine {
  /**
   * Transparent risk score calculation (0 - 100)
   */
  static calculateShipmentRisk(
    docs: DocumentRecord[],
    discrepancies: DiscrepancyRecord[]
  ): RiskAnalysis {
    let score = 0;
    const factors: RiskAnalysis['factors'] = [];

    // Filter active/open discrepancies (resolved or rejected ones do not penalize)
    const activeDiscrepancies = discrepancies.filter(
      (d) => d.status === 'OPEN' || d.status === 'IN_REVIEW'
    );
    const resolvedDiscrepancies = discrepancies.filter(
      (d) => d.status === 'RESOLVED' || d.status === 'VERIFIED'
    );

    // 1. Mandatory Document Completeness
    const docTypes = new Set(docs.map((d) => d.documentType));
    const mandatoryTypes: Array<{ type: any; label: string }> = [
      { type: 'COMMERCIAL_INVOICE', label: 'Commercial Invoice' },
      { type: 'PACKING_LIST', label: 'Packing List' },
      { type: 'SHIPPING_BILL', label: 'Shipping Bill' },
    ];

    let missingDocs = 0;
    for (const req of mandatoryTypes) {
      if (!docTypes.has(req.type)) {
        missingDocs++;
        score += 15;
        factors.push({
          name: `Missing Mandatory Document: ${req.label}`,
          weight: 15,
          impact: 'High Customs Rejection Risk',
          points: 15,
        });
      }
    }

    if (missingDocs === 0 && docs.length > 0) {
      factors.push({
        name: 'Mandatory Export Documents Present',
        weight: 0,
        impact: 'Baseline Compliant',
        points: 0,
      });
    }

    // 2. Discrepancy Severity Weighting
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    for (const d of activeDiscrepancies) {
      if (d.severity === 'CRITICAL') {
        criticalCount++;
        score += 30;
      } else if (d.severity === 'HIGH') {
        highCount++;
        score += 18;
      } else if (d.severity === 'MEDIUM') {
        mediumCount++;
        score += 10;
      } else {
        lowCount++;
        score += 4;
      }
    }

    if (criticalCount > 0) {
      factors.push({
        name: `${criticalCount} Critical Unresolved Discrepanc${criticalCount > 1 ? 'ies' : 'y'}`,
        weight: criticalCount * 30,
        impact: 'Severe Clearance Blockade Risk',
        points: criticalCount * 30,
      });
    }

    if (highCount > 0) {
      factors.push({
        name: `${highCount} High-Severity Discrepanc${highCount > 1 ? 'ies' : 'y'}`,
        weight: highCount * 18,
        impact: 'Customs Inspection / Demurrage Risk',
        points: highCount * 18,
      });
    }

    if (mediumCount > 0) {
      factors.push({
        name: `${mediumCount} Medium-Severity Discrepanc${mediumCount > 1 ? 'ies' : 'y'}`,
        weight: mediumCount * 10,
        impact: 'Banking / LC Payment Discrepancy Risk',
        points: mediumCount * 10,
      });
    }

    // 3. Human Resolution Credit
    if (resolvedDiscrepancies.length > 0) {
      const credit = Math.min(25, resolvedDiscrepancies.length * 10);
      score = Math.max(0, score - credit);
      factors.push({
        name: `${resolvedDiscrepancies.length} Discrepanc${resolvedDiscrepancies.length > 1 ? 'ies' : 'y'} Resolved by Human Officer`,
        weight: -credit,
        impact: 'Risk Mitigated by Verified Review',
        points: -credit,
      });
    }

    // 4. AI Confidence Penalties
    let lowConfCount = 0;
    for (const doc of docs) {
      if (doc.extractedData) {
        const fields = Object.values(doc.extractedData).filter(
          (f: any) => f && typeof f === 'object' && 'confidence' in f
        );
        for (const f of fields as any[]) {
          if (f.confidence < 0.8) lowConfCount++;
        }
      }
    }

    if (lowConfCount > 2) {
      score += 5;
      factors.push({
        name: `${lowConfCount} Low-Confidence AI Extractions`,
        weight: 5,
        impact: 'Manual Document Visual Inspection Advised',
        points: 5,
      });
    }

    // Cap between 0 and 100
    score = Math.min(100, Math.max(0, score));

    // Determine Tier
    let tier: RiskTier = 'LOW';
    if (score > 70) tier = 'CRITICAL';
    else if (score > 40) tier = 'HIGH';
    else if (score > 20) tier = 'MODERATE';

    let summary = '';
    if (tier === 'CRITICAL') {
      summary = `Critical clearance alert: ${criticalCount} critical discrepancy requires rectification before container loading or customs submission.`;
    } else if (tier === 'HIGH') {
      summary = `High risk detected across documentation set. Inconsistencies will trigger customs query at port of discharge.`;
    } else if (tier === 'MODERATE') {
      summary = `Moderate risk: Minor operational or date variances present. Verification review advised prior to sail date.`;
    } else {
      summary = `Low risk: Documentation set is consistent and verified for export submission.`;
    }

    return {
      score,
      tier,
      summary,
      factors,
    };
  }

  /**
   * Calculates Export Readiness Score (0 - 100%) and checklist
   */
  static calculateExportReadiness(
    docs: DocumentRecord[],
    discrepancies: DiscrepancyRecord[]
  ): { readiness: ExportReadiness; checklist: ChecklistItem[] } {
    const docTypes = new Set(docs.map((d) => d.documentType));
    const openDiscrepancies = discrepancies.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW');
    const criticalOpen = openDiscrepancies.filter((d) => d.severity === 'CRITICAL').length;
    const highOpen = openDiscrepancies.filter((d) => d.severity === 'HIGH').length;

    // 1. Documents complete (25%)
    const hasInvoice = docTypes.has('COMMERCIAL_INVOICE');
    const hasPackingList = docTypes.has('PACKING_LIST');
    const hasShippingBill = docTypes.has('SHIPPING_BILL');
    const hasQC = docTypes.has('QUALITY_CERTIFICATE');

    let docsScore = 0;
    if (hasInvoice) docsScore += 35;
    if (hasPackingList) docsScore += 30;
    if (hasShippingBill) docsScore += 25;
    if (hasQC) docsScore += 10;
    docsScore = Math.min(100, docsScore);

    // 2. Data Consistency (25%)
    let consistencyScore = 100;
    consistencyScore -= criticalOpen * 30;
    consistencyScore -= highOpen * 15;
    consistencyScore -= openDiscrepancies.filter((d) => d.severity === 'MEDIUM').length * 8;
    consistencyScore = Math.max(0, Math.min(100, consistencyScore));

    // 3. Compliance Fields (20%)
    let complianceScore = 95;
    if (!hasShippingBill) complianceScore -= 25;
    if (openDiscrepancies.some((d) => d.category === 'COMPLIANCE')) complianceScore -= 20;
    complianceScore = Math.max(0, complianceScore);

    // 4. Critical Issues Gate (20%)
    const criticalScore = criticalOpen === 0 ? 100 : Math.max(0, 100 - criticalOpen * 50);

    // 5. Human Verification (10%)
    const totalDisc = discrepancies.length;
    const resolvedCount = discrepancies.filter((d) => d.status === 'RESOLVED' || d.status === 'VERIFIED').length;
    let humanScore = 100;
    if (totalDisc > 0) {
      humanScore = Math.round((resolvedCount / totalDisc) * 100);
    }

    // Weighted Total Score
    const totalReadiness = Math.round(
      docsScore * 0.25 +
      consistencyScore * 0.25 +
      complianceScore * 0.2 +
      criticalScore * 0.2 +
      humanScore * 0.1
    );

    let status: ExportReadiness['status'] = 'NEEDS_REVIEW';
    if (totalReadiness >= 90 && criticalOpen === 0) {
      status = 'EXPORT_READY';
    } else if (criticalOpen > 0 || totalReadiness < 60) {
      status = 'BLOCKED';
    }

    const readiness: ExportReadiness = {
      score: totalReadiness,
      status,
      breakdown: {
        documentsComplete: docsScore,
        dataConsistency: consistencyScore,
        complianceFields: complianceScore,
        criticalIssues: criticalScore,
        humanVerification: humanScore,
      },
    };

    // Generate standard Checklist Items
    const checklist: ChecklistItem[] = [
      {
        id: 'chk-inv',
        shipmentId: '',
        category: 'DOCUMENTS',
        title: 'Commercial Invoice Complete',
        description: hasInvoice ? 'Document attached and parsed with financial values.' : 'Commercial Invoice not found in manifest.',
        status: hasInvoice ? 'PASSED' : 'FAILED',
      },
      {
        id: 'chk-pl',
        shipmentId: '',
        category: 'DOCUMENTS',
        title: 'Packing List Detailed Breakdown',
        description: hasPackingList ? 'Cartons, tare weights, and dimensions registered.' : 'Packing list missing.',
        status: hasPackingList ? 'PASSED' : 'FAILED',
      },
      {
        id: 'chk-sb',
        shipmentId: '',
        category: 'DOCUMENTS',
        title: 'Customs Shipping Bill Entry',
        description: hasShippingBill ? 'Declared at customs portal.' : 'Pending shipping bill issuance.',
        status: hasShippingBill ? 'PASSED' : 'WARNING',
      },
      {
        id: 'chk-qc',
        shipmentId: '',
        category: 'DOCUMENTS',
        title: 'Inspection / Quality Certificate',
        description: hasQC ? 'Certified by regulatory testing agency.' : 'Inspection certificate optional/pending.',
        status: hasQC ? 'PASSED' : 'WARNING',
      },
      {
        id: 'chk-qty-match',
        shipmentId: '',
        category: 'DATA_CONSISTENCY',
        title: 'Package & Quantity Harmonization',
        description: openDiscrepancies.some((d) => d.category === 'QUANTITY') ? 'Mismatched carton or piece counts detected.' : 'Uniform quantities across invoice and packing list.',
        status: openDiscrepancies.some((d) => d.category === 'QUANTITY') ? 'FAILED' : 'PASSED',
      },
      {
        id: 'chk-wt-match',
        shipmentId: '',
        category: 'DATA_CONSISTENCY',
        title: 'Gross & Net Weight Alignment',
        description: openDiscrepancies.some((d) => d.category === 'WEIGHT') ? 'Weight discrepancy detected between manifest documents.' : 'All declared weights match within 0.1% tolerance.',
        status: openDiscrepancies.some((d) => d.category === 'WEIGHT') ? 'WARNING' : 'PASSED',
      },
      {
        id: 'chk-hs-uniform',
        shipmentId: '',
        category: 'COMPLIANCE',
        title: 'HS Code Verification (Harmonized Tariff)',
        description: openDiscrepancies.some((d) => d.category === 'COMPLIANCE' && d.field.includes('HS')) ? 'Discrepant tariff sub-headings identified.' : 'Harmonized System 8-digit tariff consistent across all forms.',
        status: openDiscrepancies.some((d) => d.category === 'COMPLIANCE') ? 'FAILED' : 'PASSED',
      },
      {
        id: 'chk-human-signoff',
        shipmentId: '',
        category: 'VERIFICATION',
        title: 'Officer Human Resolution Sign-off',
        description: openDiscrepancies.length === 0 ? 'All parameters verified.' : `${openDiscrepancies.length} open issue(s) awaiting verification sign-off.`,
        status: openDiscrepancies.length === 0 ? 'PASSED' : 'PENDING',
      },
    ];

    return { readiness, checklist };
  }
}
