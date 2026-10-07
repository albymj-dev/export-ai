import crypto from 'crypto';
import {
  DocumentRecord,
  DiscrepancyRecord,
  DiscrepancySeverity,
  ExtractedDocumentData,
} from '@/types';
import { Normalizer } from './normalizer';

export interface ComparisonResult {
  discrepancies: DiscrepancyRecord[];
  matchedCount: number;
  totalComparisons: number;
}

export class ComparisonEngine {
  /**
   * Compares all documents associated with a shipment and generates discrepancies
   */
  static runCrossCheck(shipmentId: string, docs: DocumentRecord[]): ComparisonResult {
    const validDocs = docs.filter((d) => d.extractedData);
    const discrepancies: DiscrepancyRecord[] = [];
    let matchedCount = 0;
    let totalComparisons = 0;

    if (validDocs.length < 2) {
      return { discrepancies: [], matchedCount: 0, totalComparisons: 0 };
    }

    // Find key documents
    const invoice = validDocs.find((d) => d.documentType === 'COMMERCIAL_INVOICE');
    const packingList = validDocs.find((d) => d.documentType === 'PACKING_LIST');
    const purchaseOrder = validDocs.find((d) => d.documentType === 'PURCHASE_ORDER');
    const shippingBill = validDocs.find((d) => d.documentType === 'SHIPPING_BILL');
    const qualityCert = validDocs.find((d) => d.documentType === 'QUALITY_CERTIFICATE');

    // 1. Commercial Invoice vs Packing List: Carton Count
    if (invoice?.extractedData && packingList?.extractedData) {
      totalComparisons++;
      const invCartons = Normalizer.parseNumber(invoice.extractedData.cartonCount?.value || invoice.extractedData.quantity?.value);
      const plCartons = Normalizer.parseNumber(packingList.extractedData.cartonCount?.value || packingList.extractedData.quantity?.value);

      if (invCartons !== null && plCartons !== null) {
        if (invCartons !== plCartons) {
          const diff = Math.abs(invCartons - plCartons);
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Carton Count',
            category: 'QUANTITY',
            severity: diff > 5 ? 'CRITICAL' : 'HIGH',
            riskScore: diff > 10 ? 85 : 65,
            docAId: invoice.id,
            docAName: `${invoice.originalName} (${invoice.extractedData.documentNumber?.value || 'Invoice'})`,
            docAType: invoice.documentType,
            valueA: invCartons,
            docBId: packingList.id,
            docBName: `${packingList.originalName} (${packingList.extractedData.documentNumber?.value || 'Packing List'})`,
            docBType: packingList.documentType,
            valueB: plCartons,
            difference: `${diff} cartons mismatch (${invCartons} vs ${plCartons})`,
            explanation: `Commercial Invoice declares ${invCartons.toLocaleString()} cartons while Packing List accounts for ${plCartons.toLocaleString()} cartons. Customs inspections at destination port will reject or hold clearance upon physical tally discrepancy.`,
            recommendation: `Confirm physical packed cartons with warehouse loading tally. Update either the Commercial Invoice or Packing List so carton counts match exactly before customs lodgement.`,
            status: 'OPEN',
            evidenceSnippet: `Invoice: "${invoice.extractedData.cartonCount?.evidence || invoice.extractedData.quantity?.evidence}" vs PL: "${packingList.extractedData.cartonCount?.evidence || packingList.extractedData.quantity?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    // 2. Commercial Invoice vs Packing List: Net Weight
    if (invoice?.extractedData && packingList?.extractedData) {
      totalComparisons++;
      const invWeight = Normalizer.normalizeWeightToKg(invoice.extractedData.netWeight?.value, invoice.extractedData.weightUnit?.value);
      const plWeight = Normalizer.normalizeWeightToKg(packingList.extractedData.netWeight?.value, packingList.extractedData.weightUnit?.value);

      if (invWeight !== null && plWeight !== null) {
        const diff = Math.abs(invWeight - plWeight);
        if (diff > 5) {
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Net Weight',
            category: 'WEIGHT',
            severity: diff > 100 ? 'HIGH' : 'MEDIUM',
            riskScore: diff > 100 ? 70 : 45,
            docAId: invoice.id,
            docAName: invoice.originalName,
            docAType: invoice.documentType,
            valueA: `${invWeight.toLocaleString()} kg`,
            docBId: packingList.id,
            docBName: packingList.originalName,
            docBType: packingList.documentType,
            valueB: `${plWeight.toLocaleString()} kg`,
            difference: `${diff.toLocaleString()} kg variance`,
            explanation: `Net weight on Commercial Invoice (${invWeight.toLocaleString()} kg) does not align with Packing List (${plWeight.toLocaleString()} kg). Port weighbridges and carrier SOLAS VGM will report mismatched manifest weights.`,
            recommendation: `Verify certified weighbridge ticket and adjust the document exhibiting the discrepancy.`,
            status: 'OPEN',
            evidenceSnippet: `Invoice: "${invoice.extractedData.netWeight?.evidence}" vs PL: "${packingList.extractedData.netWeight?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    // 3. Purchase Order vs Commercial Invoice: Financial Totals
    if (purchaseOrder?.extractedData && invoice?.extractedData) {
      totalComparisons++;
      const poVal = Normalizer.parseNumber(purchaseOrder.extractedData.totalValue?.value);
      const invVal = Normalizer.parseNumber(invoice.extractedData.totalValue?.value);

      if (poVal !== null && invVal !== null) {
        if (poVal !== invVal) {
          const diff = Math.abs(poVal - invVal);
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Total Invoice Value',
            category: 'FINANCIAL',
            severity: 'CRITICAL',
            riskScore: 80,
            docAId: purchaseOrder.id,
            docAName: purchaseOrder.originalName,
            docAType: purchaseOrder.documentType,
            valueA: `${Normalizer.normalizeCurrency(purchaseOrder.extractedData.currency?.value)} ${poVal.toLocaleString()}`,
            docBId: invoice.id,
            docBName: invoice.originalName,
            docBType: invoice.documentType,
            valueB: `${Normalizer.normalizeCurrency(invoice.extractedData.currency?.value)} ${invVal.toLocaleString()}`,
            difference: `Variance of ${diff.toLocaleString()}`,
            explanation: `Invoiced amount differs from the contracted Purchase Order. Bank Letter of Credit (LC) will be dishonored under UCP 600 rules due to commercial total discrepancy.`,
            recommendation: `Align invoiced unit price and totals with the buyer purchase order terms or obtain an approved PO amendment from the buyer.`,
            status: 'OPEN',
            evidenceSnippet: `PO: "${purchaseOrder.extractedData.totalValue?.evidence}" vs Invoice: "${invoice.extractedData.totalValue?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    // 4. HS Code Cross-Verification (Invoice vs Shipping Bill or QC)
    const otherDoc = shippingBill?.extractedData ? shippingBill : qualityCert;
    if (invoice?.extractedData && otherDoc?.extractedData) {
      totalComparisons++;
      const invHs = Normalizer.normalizeHsCode(invoice.extractedData.hsCode?.value);
      const otherHs = Normalizer.normalizeHsCode(otherDoc.extractedData.hsCode?.value);

      if (invHs && otherHs) {
        if (invHs !== otherHs) {
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Harmonized System (HS) Code',
            category: 'COMPLIANCE',
            severity: 'HIGH',
            riskScore: 75,
            docAId: invoice.id,
            docAName: invoice.originalName,
            docAType: invoice.documentType,
            valueA: invoice.extractedData.hsCode?.value || invHs,
            docBId: otherDoc.id,
            docBName: otherDoc.originalName,
            docBType: otherDoc.documentType,
            valueB: otherDoc.extractedData.hsCode?.value || otherHs,
            difference: `Conflicting HS codes: ${invHs} vs ${otherHs}`,
            explanation: `Customs tariff classification differs between Commercial Invoice and ${otherDoc.documentType}. Conflicting HS codes trigger customs tariff re-assessment, preferential duty denial, and anti-dumping checks.`,
            recommendation: `Standardize on the validated national 8-digit tariff classification across all export documentation.`,
            status: 'OPEN',
            evidenceSnippet: `Invoice: "${invoice.extractedData.hsCode?.evidence}" vs ${otherDoc.documentType}: "${otherDoc.extractedData.hsCode?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    // 5. Container Number Cross-Verification (Shipping Bill vs Invoice / Packing List)
    const refDoc = packingList?.extractedData ? packingList : invoice;
    if (shippingBill?.extractedData && refDoc?.extractedData) {
      totalComparisons++;
      const sbContainers = shippingBill.extractedData.containerNumbers?.value || [];
      const refContainers = refDoc.extractedData.containerNumbers?.value || [];

      if (sbContainers.length > 0 && refContainers.length > 0) {
        const sbClean = sbContainers.map((c) => c.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
        const refClean = refContainers.map((c) => c.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
        const match = sbClean.some((c) => refClean.includes(c));

        if (!match) {
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Container Number',
            category: 'SHIPMENT',
            severity: 'CRITICAL',
            riskScore: 90,
            docAId: shippingBill.id,
            docAName: shippingBill.originalName,
            docAType: shippingBill.documentType,
            valueA: sbContainers.join(', '),
            docBId: refDoc.id,
            docBName: refDoc.originalName,
            docBType: refDoc.documentType,
            valueB: refContainers.join(', '),
            difference: 'Mismatched container identification numbers',
            explanation: `Shipping Bill container declaration does not match the container noted on ${refDoc.documentType}. Port terminal operating systems (TOS) will block container gate-in at terminal.`,
            recommendation: `Inspect ISO container prefix and 7-digit verification checksum on the physical container door and update the documentation.`,
            status: 'OPEN',
            evidenceSnippet: `Shipping Bill: "${shippingBill.extractedData.containerNumbers?.evidence}" vs ${refDoc.documentType}: "${refDoc.extractedData.containerNumbers?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    // 6. Dates Cross-Verification (PO vs Shipping Bill departure date)
    if (purchaseOrder?.extractedData && shippingBill?.extractedData) {
      totalComparisons++;
      const poDate = Normalizer.normalizeDate(purchaseOrder.extractedData.issueDate?.value);
      const sbDate = Normalizer.normalizeDate(shippingBill.extractedData.issueDate?.value);

      if (poDate && sbDate) {
        // If shipping bill date is significantly after expected PO dispatch
        const diffDays = Math.round((new Date(sbDate).getTime() - new Date(poDate).getTime()) / (1000 * 3600 * 24));
        if (diffDays > 14) {
          discrepancies.push({
            id: `disc-${crypto.randomUUID()}`,
            shipmentId,
            field: 'Filing & Dispatch Dates',
            category: 'DATES',
            severity: 'MEDIUM',
            riskScore: 40,
            docAId: purchaseOrder.id,
            docAName: purchaseOrder.originalName,
            docAType: purchaseOrder.documentType,
            valueA: poDate,
            docBId: shippingBill.id,
            docBName: shippingBill.originalName,
            docBType: shippingBill.documentType,
            valueB: sbDate,
            difference: `${diffDays} days elapsed between purchase order date and export filing`,
            explanation: `Extended gap between PO placement and shipping bill lodging. May violate buyer latest shipment clause in Letter of Credit.`,
            recommendation: `Check Letter of Credit expiry and latest shipment clause. If needed, request LC extension from buyer.`,
            status: 'OPEN',
            evidenceSnippet: `PO: "${purchaseOrder.extractedData.issueDate?.evidence}" vs Shipping Bill: "${shippingBill.extractedData.issueDate?.evidence}"`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          matchedCount++;
        }
      }
    }

    return {
      discrepancies,
      matchedCount,
      totalComparisons,
    };
  }
}
