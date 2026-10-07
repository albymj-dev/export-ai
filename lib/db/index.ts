import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  ShipmentRecord,
  DocumentRecord,
  DiscrepancyRecord,
  ChecklistItem,
  AuditLogRecord,
  EmailDraft,
  VerificationAssistantMessage,
} from '@/types';

interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    organization: string;
  }>;
  shipments: ShipmentRecord[];
  documents: DocumentRecord[];
  discrepancies: DiscrepancyRecord[];
  checklistItems: ChecklistItem[];
  auditLogs: AuditLogRecord[];
  emailDrafts: EmailDraft[];
  assistantMessages: Record<string, VerificationAssistantMessage[]>;
}

class JsonDatabase {
  private filePath: string;
  private cache: DatabaseSchema | null = null;
  private isWriting = false;

  constructor() {
    this.filePath = path.resolve(process.cwd(), '.storage', 'db.json');
  }

  private async ensureStorageFile(): Promise<DatabaseSchema> {
    if (this.cache) return this.cache;

    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const data = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(data);
      return this.cache!;
    } catch {
      const initial: DatabaseSchema = {
        users: [
          {
            id: 'user_officer_kerala',
            email: 'albymathewjoshy@gmail.com',
            name: 'Alby Mathew Joshy',
            role: 'Senior Verification Officer',
            organization: 'Kerala Export Inspection Council',
          },
        ],
        shipments: [],
        documents: [],
        discrepancies: [],
        checklistItems: [],
        auditLogs: [],
        emailDrafts: [],
        assistantMessages: {},
      };
      this.cache = initial;
      await this.saveToFile();
      return initial;
    }
  }

  private async saveToFile() {
    if (!this.cache) return;
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const tempPath = `${this.filePath}.${crypto.randomUUID()}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(this.cache, null, 2), 'utf-8');
      await fs.rename(tempPath, this.filePath);
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  async getShipments(userId?: string): Promise<ShipmentRecord[]> {
    const data = await this.ensureStorageFile();
    if (!userId) return data.shipments;
    return data.shipments.filter((s) => s.userId === userId || s.userId === 'user_officer_kerala');
  }

  async getShipmentById(id: string): Promise<ShipmentRecord | null> {
    const data = await this.ensureStorageFile();
    return data.shipments.find((s) => s.id === id) || null;
  }

  async createShipment(shipment: ShipmentRecord): Promise<ShipmentRecord> {
    const data = await this.ensureStorageFile();
    data.shipments.unshift(shipment);
    await this.saveToFile();
    return shipment;
  }

  async updateShipment(id: string, updates: Partial<ShipmentRecord>): Promise<ShipmentRecord | null> {
    const data = await this.ensureStorageFile();
    const idx = data.shipments.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    data.shipments[idx] = {
      ...data.shipments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveToFile();
    return data.shipments[idx];
  }

  async deleteShipment(id: string): Promise<boolean> {
    const data = await this.ensureStorageFile();
    data.shipments = data.shipments.filter((s) => s.id !== id);
    data.documents = data.documents.filter((d) => d.shipmentId !== id);
    data.discrepancies = data.discrepancies.filter((d) => d.shipmentId !== id);
    data.checklistItems = data.checklistItems.filter((c) => c.shipmentId !== id);
    await this.saveToFile();
    return true;
  }

  // Documents
  async getDocuments(shipmentId: string): Promise<DocumentRecord[]> {
    const data = await this.ensureStorageFile();
    return data.documents.filter((d) => d.shipmentId === shipmentId);
  }

  async getDocumentById(id: string): Promise<DocumentRecord | null> {
    const data = await this.ensureStorageFile();
    return data.documents.find((d) => d.id === id) || null;
  }

  async createDocument(doc: DocumentRecord): Promise<DocumentRecord> {
    const data = await this.ensureStorageFile();
    data.documents.push(doc);
    // Update shipment document count
    const sIdx = data.shipments.findIndex((s) => s.id === doc.shipmentId);
    if (sIdx !== -1) {
      data.shipments[sIdx].documentCount = data.documents.filter((d) => d.shipmentId === doc.shipmentId).length;
    }
    await this.saveToFile();
    return doc;
  }

  async updateDocument(id: string, updates: Partial<DocumentRecord>): Promise<DocumentRecord | null> {
    const data = await this.ensureStorageFile();
    const idx = data.documents.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    data.documents[idx] = {
      ...data.documents[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveToFile();
    return data.documents[idx];
  }

  // Discrepancies
  async getDiscrepancies(shipmentId: string): Promise<DiscrepancyRecord[]> {
    const data = await this.ensureStorageFile();
    return data.discrepancies.filter((d) => d.shipmentId === shipmentId);
  }

  async setDiscrepancies(shipmentId: string, items: DiscrepancyRecord[]): Promise<void> {
    const data = await this.ensureStorageFile();
    data.discrepancies = data.discrepancies.filter((d) => d.shipmentId !== shipmentId).concat(items);
    await this.saveToFile();
  }

  async updateDiscrepancy(id: string, updates: Partial<DiscrepancyRecord>): Promise<DiscrepancyRecord | null> {
    const data = await this.ensureStorageFile();
    const idx = data.discrepancies.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    data.discrepancies[idx] = {
      ...data.discrepancies[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveToFile();
    return data.discrepancies[idx];
  }

  // Checklist
  async getChecklist(shipmentId: string): Promise<ChecklistItem[]> {
    const data = await this.ensureStorageFile();
    return data.checklistItems.filter((c) => c.shipmentId === shipmentId);
  }

  async setChecklist(shipmentId: string, items: ChecklistItem[]): Promise<void> {
    const data = await this.ensureStorageFile();
    data.checklistItems = data.checklistItems.filter((c) => c.shipmentId !== shipmentId).concat(items);
    await this.saveToFile();
  }

  // Audit Logs
  async getAuditLogs(shipmentId?: string): Promise<AuditLogRecord[]> {
    const data = await this.ensureStorageFile();
    if (!shipmentId) return data.auditLogs.slice(0, 50);
    return data.auditLogs.filter((a) => a.shipmentId === shipmentId);
  }

  async logAudit(log: Omit<AuditLogRecord, 'id' | 'timestamp'>): Promise<AuditLogRecord> {
    const data = await this.ensureStorageFile();
    const entry: AuditLogRecord = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    data.auditLogs.unshift(entry);
    // Keep max 200 logs
    if (data.auditLogs.length > 200) {
      data.auditLogs = data.auditLogs.slice(0, 200);
    }
    await this.saveToFile();
    return entry;
  }

  // Assistant messages
  async getAssistantMessages(shipmentId: string): Promise<VerificationAssistantMessage[]> {
    const data = await this.ensureStorageFile();
    return data.assistantMessages[shipmentId] || [];
  }

  async addAssistantMessage(shipmentId: string, msg: VerificationAssistantMessage): Promise<void> {
    const data = await this.ensureStorageFile();
    if (!data.assistantMessages[shipmentId]) {
      data.assistantMessages[shipmentId] = [];
    }
    data.assistantMessages[shipmentId].push(msg);
    await this.saveToFile();
  }

  // Seed Hackathon Demo
  async seedHackathonDemo(force = false): Promise<string> {
    const data = await this.ensureStorageFile();
    const demoRef = 'EXP-KERALA-2026-001';
    const existing = data.shipments.find((s) => s.shipmentReference === demoRef);

    if (existing && !force) {
      return existing.id;
    }

    if (existing) {
      await this.deleteShipment(existing.id);
    }

    const shipmentId = 'demo-kerala-2026-001';
    const userId = 'user_officer_kerala';

    const demoShipment: ShipmentRecord = {
      id: shipmentId,
      userId,
      shipmentReference: demoRef,
      exporter: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala',
      buyer: 'EuroSpice Imports B.V., Rotterdam, Netherlands',
      consignee: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam',
      countryOfOrigin: 'India (Kerala)',
      destinationCountry: 'Netherlands',
      portOfLoading: 'Cochin Port (INCOK), India',
      portOfDischarge: 'Port of Rotterdam (NLRTM), Netherlands',
      shipmentDate: '2026-10-18',
      incoterms: 'CIF Rotterdam',
      currency: 'USD',
      status: 'NEEDS_REVIEW',
      riskScore: 48,
      riskTier: 'HIGH',
      exportReadinessScore: 78,
      exportReadinessStatus: 'NEEDS_REVIEW',
      documentCount: 5,
      discrepancyCount: 3,
      criticalDiscrepancies: 1,
      aiSummary: {
        overview:
          'Verification completed for 5 export documents under container manifest MSKU-7491024. A critical 20-carton discrepancy was identified between the Commercial Invoice (1,200 cartons) and Packing List (1,180 cartons), along with a corresponding 400 kg gross weight variance. Export customs clearance at Cochin will require packing list rectification or an amended invoice prior to port gate-in.',
        keyFindings: [
          'Critical carton mismatch: Commercial Invoice states 1,200 Cartons, Packing List lists 1,180 Cartons (Difference: 20 cartons).',
          'Weight mismatch: Gross weight discrepancy of 400 kg between Invoice (24,000 kg) and Packing List (23,600 kg).',
          'Departure date variance: Shipping Bill filing specifies estimated departure 2026-10-18 vs Purchase Order expected dispatch 2026-10-15.',
          'Harmonized System (HS) Code verified: 0904.11.10 (Black Pepper, neither crushed nor ground) perfectly consistent across all documents.',
          'Buyer and consignee identity verified: EuroSpice Imports B.V. verified with Spices Board RCMC #SB/KOC/EXP/4819.',
        ],
        recommendations: [
          'Immediate physical recount at Cochin CFS warehouse to confirm whether 1,180 or 1,200 cartons were stuffed into Container MSKU-7491024.',
          'Issue amended Commercial Invoice or revised Packing List reflecting the verified physical count before filing final Shipping Bill with Indian Customs ICEGATE.',
          'Re-run automated EXPORTAI cross-check once corrected document is uploaded.',
        ],
        generatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5 Demo Documents
    const docs: DocumentRecord[] = [
      {
        id: 'doc-inv-001',
        shipmentId,
        userId,
        fileName: 'commercial_invoice_9042.pdf',
        originalName: 'Commercial_Invoice_INV-2026-9042.pdf',
        fileSize: 245100,
        mimeType: 'application/pdf',
        documentType: 'COMMERCIAL_INVOICE',
        storagePath: `documents/${userId}/${shipmentId}/doc-inv-001.pdf`,
        uploadStatus: 'COMPLETE',
        extractionStatus: 'COMPLETED',
        extractedData: {
          documentType: 'COMMERCIAL_INVOICE',
          documentNumber: { value: 'INV-2026-9042', confidence: 0.99, page: 1, evidence: 'INVOICE NO: INV-2026-9042' },
          issueDate: { value: '2026-10-10', confidence: 0.98, page: 1, evidence: 'Date of Issue: 10-Oct-2026' },
          seller: { value: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala', confidence: 0.97, page: 1, evidence: 'Exporter: Malabar Spices & Agro Exports Pvt. Ltd., Willingdon Island, Kochi 682003, Kerala, India' },
          buyer: { value: 'EuroSpice Imports B.V., Rotterdam, Netherlands', confidence: 0.99, page: 1, evidence: 'Buyer: EuroSpice Imports B.V., Westblaak 180, 3012 KN Rotterdam, Netherlands' },
          consignee: { value: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam', confidence: 0.98, page: 1, evidence: 'Consignee: EuroSpice Logistics Hub, Coloradoweg 42, Maasvlakte, Rotterdam' },
          productDescription: { value: 'Premium Grade Black Pepper (Tellicherry Extra Bold) & Green Cardamom', confidence: 0.96, page: 1, evidence: 'Description: Premium Grade Black Pepper (Tellicherry Extra Bold, TGSEB Grade) & Alleppey Green Cardamom' },
          hsCode: { value: '0904.11.10', confidence: 0.99, page: 1, evidence: 'ITC-HS Code: 0904.11.10 (Pepper neither crushed nor ground)' },
          quantity: { value: 1200, confidence: 0.99, page: 1, evidence: 'Total Quantity: 1,200 Cartons' },
          quantityUnit: { value: 'CARTONS', confidence: 0.98, page: 1, evidence: 'Units: Cartons' },
          cartonCount: { value: 1200, confidence: 0.99, page: 1, evidence: 'Total Packages: 1,200 CTNS' },
          grossWeight: { value: 24800, confidence: 0.97, page: 1, evidence: 'Gross Weight: 24,800.00 KGS' },
          netWeight: { value: 24000, confidence: 0.98, page: 1, evidence: 'Net Weight: 24,000.00 KGS' },
          weightUnit: { value: 'KG', confidence: 0.99, page: 1, evidence: 'KGS' },
          unitPrice: { value: 120, confidence: 0.95, page: 1, evidence: 'Unit Price: USD 120.00 / Ctn' },
          totalValue: { value: 144000, confidence: 0.99, page: 1, evidence: 'Total Invoice Value: USD 144,000.00 CIF Rotterdam' },
          currency: { value: 'USD', confidence: 0.99, page: 1, evidence: 'Currency: US Dollar (USD)' },
          countryOfOrigin: { value: 'India', confidence: 0.99, page: 1, evidence: 'Country of Origin of Goods: India' },
          destinationCountry: { value: 'Netherlands', confidence: 0.99, page: 1, evidence: 'Country of Final Destination: Netherlands' },
          portOfLoading: { value: 'Cochin Port (INCOK)', confidence: 0.98, page: 1, evidence: 'Port of Loading: Cochin Sea Port, Kerala, India' },
          portOfDischarge: { value: 'Rotterdam (NLRTM)', confidence: 0.98, page: 1, evidence: 'Port of Discharge: Rotterdam Sea Port, Netherlands' },
          vessel: { value: 'CMA CGM BHARAT V.2604W', confidence: 0.94, page: 1, evidence: 'Vessel / Voyage: CMA CGM BHARAT / 2604W' },
          containerNumbers: { value: ['MSKU-7491024'], confidence: 0.98, page: 1, evidence: 'Container No: MSKU-7491024 / Seal: INCOK-98321' },
          purchaseOrderNumber: { value: 'PO-EUR-8831', confidence: 0.99, page: 1, evidence: 'Buyer PO Ref: PO-EUR-8831 dated 01-Oct-2026' },
          shippingBillNumber: { value: 'SB-COCHIN-49204', confidence: 0.95, page: 1, evidence: 'Expected SB: SB-COCHIN-49204' },
          invoiceNumber: { value: 'INV-2026-9042', confidence: 0.99, page: 1, evidence: 'Invoice: INV-2026-9042' },
          certificationNumbers: { value: ['SPICE-RCMC-4819'], confidence: 0.96, page: 1, evidence: 'Spices Board Reg: SB/KOC/EXP/4819' },
          rawSummary: 'Commercial Invoice for 1,200 cartons of Tellicherry Black Pepper valued at $144,000 CIF Rotterdam.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-pl-002',
        shipmentId,
        userId,
        fileName: 'packing_list_9042.pdf',
        originalName: 'Packing_List_PL-2026-9042.pdf',
        fileSize: 198400,
        mimeType: 'application/pdf',
        documentType: 'PACKING_LIST',
        storagePath: `documents/${userId}/${shipmentId}/doc-pl-002.pdf`,
        uploadStatus: 'COMPLETE',
        extractionStatus: 'COMPLETED',
        extractedData: {
          documentType: 'PACKING_LIST',
          documentNumber: { value: 'PL-2026-9042', confidence: 0.99, page: 1, evidence: 'PACKING LIST NO: PL-2026-9042' },
          issueDate: { value: '2026-10-11', confidence: 0.98, page: 1, evidence: 'Date: 11-Oct-2026' },
          seller: { value: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala', confidence: 0.97, page: 1, evidence: 'Shipper: Malabar Spices & Agro Exports Pvt. Ltd.' },
          buyer: { value: 'EuroSpice Imports B.V., Rotterdam, Netherlands', confidence: 0.99, page: 1, evidence: 'Consignee: EuroSpice Imports B.V., Rotterdam' },
          consignee: { value: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam', confidence: 0.98, page: 1, evidence: 'Deliver to: EuroSpice Logistics Hub, Rotterdam' },
          productDescription: { value: 'Premium Grade Black Pepper (Tellicherry Extra Bold) & Green Cardamom', confidence: 0.96, page: 1, evidence: 'Commodity: Tellicherry Extra Bold Black Pepper' },
          hsCode: { value: '0904.11.10', confidence: 0.98, page: 1, evidence: 'HS Code: 0904.11.10' },
          quantity: { value: 1180, confidence: 0.99, page: 1, evidence: 'Total Cartons Packed: 1,180 Cartons' },
          quantityUnit: { value: 'CARTONS', confidence: 0.98, page: 1, evidence: 'Cartons' },
          cartonCount: { value: 1180, confidence: 0.99, page: 1, evidence: 'Total Packed: 1,180 CTNS (Marks & Nos: 0001 to 1180)' },
          grossWeight: { value: 24390, confidence: 0.97, page: 1, evidence: 'Total Gross Weight: 24,390.00 KGS' },
          netWeight: { value: 23600, confidence: 0.98, page: 1, evidence: 'Total Net Weight: 23,600.00 KGS (1180 ctns x 20kg)' },
          weightUnit: { value: 'KG', confidence: 0.99, page: 1, evidence: 'KGS' },
          unitPrice: { value: null, confidence: 0.5, page: 1, evidence: 'N/A in Packing List' },
          totalValue: { value: null, confidence: 0.5, page: 1, evidence: 'N/A' },
          currency: { value: 'USD', confidence: 0.9, page: 1, evidence: 'N/A' },
          countryOfOrigin: { value: 'India', confidence: 0.99, page: 1, evidence: 'Origin: India' },
          destinationCountry: { value: 'Netherlands', confidence: 0.99, page: 1, evidence: 'Destination: Netherlands' },
          portOfLoading: { value: 'Cochin Port (INCOK)', confidence: 0.98, page: 1, evidence: 'POL: Cochin, India' },
          portOfDischarge: { value: 'Rotterdam (NLRTM)', confidence: 0.98, page: 1, evidence: 'POD: Rotterdam, Netherlands' },
          vessel: { value: 'CMA CGM BHARAT V.2604W', confidence: 0.95, page: 1, evidence: 'Vessel: CMA CGM BHARAT V.2604W' },
          containerNumbers: { value: ['MSKU-7491024'], confidence: 0.98, page: 1, evidence: 'Container: MSKU-7491024' },
          purchaseOrderNumber: { value: 'PO-EUR-8831', confidence: 0.99, page: 1, evidence: 'Ref PO: PO-EUR-8831' },
          shippingBillNumber: { value: 'SB-COCHIN-49204', confidence: 0.92, page: 1, evidence: 'SB: SB-COCHIN-49204' },
          invoiceNumber: { value: 'INV-2026-9042', confidence: 0.99, page: 1, evidence: 'Invoice Ref: INV-2026-9042' },
          certificationNumbers: { value: ['SPICE-RCMC-4819'], confidence: 0.95, page: 1, evidence: 'RCMC: 4819' },
          rawSummary: 'Packing List showing 1,180 cartons packed (400kg net weight lower than invoice).',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-po-003',
        shipmentId,
        userId,
        fileName: 'purchase_order_8831.pdf',
        originalName: 'Purchase_Order_PO-EUR-8831.pdf',
        fileSize: 182400,
        mimeType: 'application/pdf',
        documentType: 'PURCHASE_ORDER',
        uploadStatus: 'COMPLETE',
        extractionStatus: 'COMPLETED',
        storagePath: `documents/${userId}/${shipmentId}/doc-po-003.pdf`,
        extractedData: {
          documentType: 'PURCHASE_ORDER',
          documentNumber: { value: 'PO-EUR-8831', confidence: 0.99, page: 1, evidence: 'PURCHASE ORDER: PO-EUR-8831' },
          issueDate: { value: '2026-10-01', confidence: 0.98, page: 1, evidence: 'PO Date: 01 October 2026' },
          seller: { value: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala', confidence: 0.97, page: 1, evidence: 'Supplier: Malabar Spices & Agro Exports Pvt. Ltd.' },
          buyer: { value: 'EuroSpice Imports B.V., Rotterdam, Netherlands', confidence: 0.99, page: 1, evidence: 'Buyer: EuroSpice Imports B.V.' },
          consignee: { value: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam', confidence: 0.98, page: 1, evidence: 'Ship to: EuroSpice Logistics Hub, Maasvlakte' },
          productDescription: { value: 'Premium Grade Black Pepper (Tellicherry Extra Bold) & Green Cardamom', confidence: 0.96, page: 1, evidence: 'Goods: Tellicherry Extra Bold Black Pepper (TGSEB)' },
          hsCode: { value: '0904.11.10', confidence: 0.98, page: 1, evidence: 'Customs Tariff: 0904.11.10' },
          quantity: { value: 1200, confidence: 0.99, page: 1, evidence: 'Order Qty: 1,200 Cartons' },
          quantityUnit: { value: 'CARTONS', confidence: 0.98, page: 1, evidence: 'Cartons (20kg net each)' },
          cartonCount: { value: 1200, confidence: 0.99, page: 1, evidence: '1,200 CTNS' },
          grossWeight: { value: 24800, confidence: 0.95, page: 1, evidence: 'Approx Gross: 24.8 MT' },
          netWeight: { value: 24000, confidence: 0.98, page: 1, evidence: 'Contracted Net: 24,000 kg' },
          weightUnit: { value: 'KG', confidence: 0.99, page: 1, evidence: 'KG' },
          unitPrice: { value: 120, confidence: 0.98, page: 1, evidence: 'Rate: $120.00 / Ctn' },
          totalValue: { value: 144000, confidence: 0.99, page: 1, evidence: 'Total PO Amount: $144,000.00' },
          currency: { value: 'USD', confidence: 0.99, page: 1, evidence: 'Currency: USD' },
          countryOfOrigin: { value: 'India', confidence: 0.99, page: 1, evidence: 'Origin: India' },
          destinationCountry: { value: 'Netherlands', confidence: 0.99, page: 1, evidence: 'Destination: Netherlands' },
          portOfLoading: { value: 'Cochin Port (INCOK)', confidence: 0.98, page: 1, evidence: 'Loading Port: Cochin' },
          portOfDischarge: { value: 'Rotterdam (NLRTM)', confidence: 0.98, page: 1, evidence: 'Discharge Port: Rotterdam' },
          vessel: { value: 'TBD', confidence: 0.7, page: 1, evidence: 'Ocean freight via scheduled carrier' },
          containerNumbers: { value: [], confidence: 0.5, page: 1, evidence: 'FCL 1x40ft HC' },
          purchaseOrderNumber: { value: 'PO-EUR-8831', confidence: 0.99, page: 1, evidence: 'PO-EUR-8831' },
          shippingBillNumber: { value: '', confidence: 0.5, page: 1, evidence: 'N/A' },
          invoiceNumber: { value: '', confidence: 0.5, page: 1, evidence: 'N/A' },
          certificationNumbers: { value: ['ISO-22000-SPICE'], confidence: 0.9, page: 1, evidence: 'Food Safety: ISO 22000' },
          rawSummary: 'Purchase Order by EuroSpice Imports for 1,200 cartons at $144,000 USD.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-sb-004',
        shipmentId,
        userId,
        fileName: 'shipping_bill_49204.pdf',
        originalName: 'Shipping_Bill_SB-COCHIN-49204.pdf',
        fileSize: 310200,
        mimeType: 'application/pdf',
        documentType: 'SHIPPING_BILL',
        uploadStatus: 'COMPLETE',
        extractionStatus: 'COMPLETED',
        storagePath: `documents/${userId}/${shipmentId}/doc-sb-004.pdf`,
        extractedData: {
          documentType: 'SHIPPING_BILL',
          documentNumber: { value: 'SB-COCHIN-49204', confidence: 0.99, page: 1, evidence: 'SHIPPING BILL NO: 49204 / ICEGATE / COCHIN CUSTOMS' },
          issueDate: { value: '2026-10-18', confidence: 0.98, page: 1, evidence: 'Filing Date: 18-Oct-2026' },
          seller: { value: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala', confidence: 0.97, page: 1, evidence: 'IEC / Exporter: 0504018291 / Malabar Spices & Agro Exports Pvt. Ltd.' },
          buyer: { value: 'EuroSpice Imports B.V., Rotterdam, Netherlands', confidence: 0.99, page: 1, evidence: 'Buyer: EuroSpice Imports B.V.' },
          consignee: { value: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam', confidence: 0.98, page: 1, evidence: 'Consignee: EuroSpice Logistics Hub' },
          productDescription: { value: 'Premium Grade Black Pepper (Tellicherry Extra Bold) & Green Cardamom', confidence: 0.96, page: 1, evidence: 'Cargo: Tellicherry Black Pepper TGSEB' },
          hsCode: { value: '0904.11.10', confidence: 0.99, page: 1, evidence: 'RITC: 09041110' },
          quantity: { value: 1200, confidence: 0.99, page: 1, evidence: 'Declared Packages: 1,200 Cartons' },
          quantityUnit: { value: 'CARTONS', confidence: 0.98, page: 1, evidence: 'CTN' },
          cartonCount: { value: 1200, confidence: 0.99, page: 1, evidence: 'Packages: 1,200 CTNS' },
          grossWeight: { value: 24800, confidence: 0.97, page: 1, evidence: 'Gross Mass: 24,800.00 KG' },
          netWeight: { value: 24000, confidence: 0.98, page: 1, evidence: 'Net Mass: 24,000.00 KG' },
          weightUnit: { value: 'KG', confidence: 0.99, page: 1, evidence: 'KG' },
          unitPrice: { value: 120, confidence: 0.95, page: 1, evidence: 'FOB equivalent valuation' },
          totalValue: { value: 144000, confidence: 0.98, page: 1, evidence: 'Invoice FOB/CIF Declared: USD 144,000.00' },
          currency: { value: 'USD', confidence: 0.99, page: 1, evidence: 'Currency: USD' },
          countryOfOrigin: { value: 'India', confidence: 0.99, page: 1, evidence: 'Country of Export: India' },
          destinationCountry: { value: 'Netherlands', confidence: 0.99, page: 1, evidence: 'Country of Discharge: Netherlands' },
          portOfLoading: { value: 'Cochin Port (INCOK)', confidence: 0.99, page: 1, evidence: 'Customs Port: INCOK1 (Cochin Sea)' },
          portOfDischarge: { value: 'Rotterdam (NLRTM)', confidence: 0.98, page: 1, evidence: 'Destination: NLRTM' },
          vessel: { value: 'CMA CGM BHARAT V.2604W', confidence: 0.96, page: 1, evidence: 'Rotation No: 2026/0941 / CMA CGM BHARAT' },
          containerNumbers: { value: ['MSKU-7491024'], confidence: 0.99, page: 1, evidence: 'Container: MSKU-7491024' },
          purchaseOrderNumber: { value: 'PO-EUR-8831', confidence: 0.98, page: 1, evidence: 'LC/PO Ref: PO-EUR-8831' },
          shippingBillNumber: { value: 'SB-COCHIN-49204', confidence: 0.99, page: 1, evidence: 'SB-COCHIN-49204' },
          invoiceNumber: { value: 'INV-2026-9042', confidence: 0.99, page: 1, evidence: 'Invoice Ref: INV-2026-9042 dated 10-10-2026' },
          certificationNumbers: { value: ['SPICE-RCMC-4819'], confidence: 0.98, page: 1, evidence: 'RCMC: SB/KOC/EXP/4819' },
          rawSummary: 'Indian Customs Shipping Bill filed for 1,200 cartons at Cochin Port under container MSKU-7491024.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'doc-qc-005',
        shipmentId,
        userId,
        fileName: 'spices_board_quality_cert.pdf',
        originalName: 'Quality_Certificate_QC-SPICE-7731.pdf',
        fileSize: 154300,
        mimeType: 'application/pdf',
        documentType: 'QUALITY_CERTIFICATE',
        uploadStatus: 'COMPLETE',
        extractionStatus: 'COMPLETED',
        storagePath: `documents/${userId}/${shipmentId}/doc-qc-005.pdf`,
        extractedData: {
          documentType: 'QUALITY_CERTIFICATE',
          documentNumber: { value: 'QC-SPICE-7731', confidence: 0.99, page: 1, evidence: 'CERTIFICATE NO: QC-SPICE-7731 / Spices Board India Quality Evaluation Lab' },
          issueDate: { value: '2026-10-12', confidence: 0.98, page: 1, evidence: 'Test Date: 12-Oct-2026' },
          seller: { value: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala', confidence: 0.97, page: 1, evidence: 'Client: Malabar Spices & Agro Exports Pvt. Ltd.' },
          buyer: { value: 'EuroSpice Imports B.V., Rotterdam, Netherlands', confidence: 0.95, page: 1, evidence: 'Destination Importer: EuroSpice Imports B.V.' },
          consignee: { value: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam', confidence: 0.94, page: 1, evidence: 'Consignee: EuroSpice Logistics Hub' },
          productDescription: { value: 'Premium Grade Black Pepper (Tellicherry Extra Bold) & Green Cardamom', confidence: 0.98, page: 1, evidence: 'Sample: Tellicherry Extra Bold Black Pepper (TGSEB Grade 4.75mm min)' },
          hsCode: { value: '0904.11.10', confidence: 0.99, page: 1, evidence: 'Tariff: 0904.11.10' },
          quantity: { value: 1200, confidence: 0.98, page: 1, evidence: 'Inspected Lot: 1,200 Cartons' },
          quantityUnit: { value: 'CARTONS', confidence: 0.98, page: 1, evidence: 'Cartons' },
          cartonCount: { value: 1200, confidence: 0.98, page: 1, evidence: 'Certified Lot Size: 1,200 CTNS' },
          grossWeight: { value: 24800, confidence: 0.95, page: 1, evidence: 'Gross Lot: 24.8 MT' },
          netWeight: { value: 24000, confidence: 0.98, page: 1, evidence: 'Net Weight: 24,000 kg' },
          weightUnit: { value: 'KG', confidence: 0.99, page: 1, evidence: 'KG' },
          unitPrice: { value: null, confidence: 0.5, page: 1, evidence: 'N/A' },
          totalValue: { value: null, confidence: 0.5, page: 1, evidence: 'N/A' },
          currency: { value: 'USD', confidence: 0.8, page: 1, evidence: 'N/A' },
          countryOfOrigin: { value: 'India', confidence: 0.99, page: 1, evidence: 'Origin: India (Kerala Region)' },
          destinationCountry: { value: 'Netherlands', confidence: 0.98, page: 1, evidence: 'EU Phytosanitary compliant' },
          portOfLoading: { value: 'Cochin Port (INCOK)', confidence: 0.98, page: 1, evidence: 'Port: Cochin' },
          portOfDischarge: { value: 'Rotterdam (NLRTM)', confidence: 0.95, page: 1, evidence: 'Port: Rotterdam' },
          vessel: { value: 'CMA CGM BHARAT V.2604W', confidence: 0.9, page: 1, evidence: 'Vessel: CMA CGM BHARAT' },
          containerNumbers: { value: ['MSKU-7491024'], confidence: 0.98, page: 1, evidence: 'Container: MSKU-7491024' },
          purchaseOrderNumber: { value: 'PO-EUR-8831', confidence: 0.98, page: 1, evidence: 'PO: PO-EUR-8831' },
          shippingBillNumber: { value: '', confidence: 0.5, page: 1, evidence: 'N/A' },
          invoiceNumber: { value: 'INV-2026-9042', confidence: 0.99, page: 1, evidence: 'Invoice Ref: INV-2026-9042' },
          certificationNumbers: { value: ['QC-SPICE-7731', 'FUM-COK-9912'], confidence: 0.99, page: 1, evidence: 'Phyto Cert # QC-SPICE-7731, Fumigation Cert # FUM-COK-9912' },
          rawSummary: 'Spices Board of India Certificate verifying pesticide residues, moisture <11%, and fumigation for 1,200 cartons.',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 3 Discrepancies (1 Critical, 1 High, 1 Medium)
    const discrepancies: DiscrepancyRecord[] = [
      {
        id: 'disc-carton-001',
        shipmentId,
        field: 'Carton Count',
        category: 'QUANTITY',
        severity: 'CRITICAL',
        riskScore: 85,
        docAId: 'doc-inv-001',
        docAName: 'Commercial Invoice (INV-2026-9042)',
        docAType: 'COMMERCIAL_INVOICE',
        valueA: 1200,
        docBId: 'doc-pl-002',
        docBName: 'Packing List (PL-2026-9042)',
        docBType: 'PACKING_LIST',
        valueB: 1180,
        difference: '20 cartons missing / discrepancy',
        explanation:
          'Commercial Invoice declares 1,200 cartons whereas Packing List only accounts for 1,180 cartons. A 20-carton shortfall creates an immediate red-flag for Indian Customs ICEGATE and Rotterdam Customs inspection, risking physical cargo detention and misdeclaration penalties.',
        recommendation:
          'Conduct physical recount at container freight station (CFS). If actual packed cartons are 1,180, issue an amended Commercial Invoice for $141,600 (1,180 ctns). If 1,200 cartons were stuffed, revise the Packing List before final shipping bill submission.',
        status: 'OPEN',
        evidenceSnippet: 'Invoice: "Total Quantity: 1,200 Cartons" vs Packing List: "Total Cartons Packed: 1,180 Cartons"',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'disc-weight-002',
        shipmentId,
        field: 'Net Weight',
        category: 'WEIGHT',
        severity: 'HIGH',
        riskScore: 72,
        docAId: 'doc-inv-001',
        docAName: 'Commercial Invoice (INV-2026-9042)',
        docAType: 'COMMERCIAL_INVOICE',
        valueA: '24,000 kg',
        docBId: 'doc-pl-002',
        docBName: 'Packing List (PL-2026-9042)',
        docBType: 'PACKING_LIST',
        valueB: '23,600 kg',
        difference: '400 kg net weight variance',
        explanation:
          'Net weight on Commercial Invoice is 24,000 kg (24 MT), while the Packing List totals 23,600 kg. This exactly mirrors the 20-carton shortfall (20 cartons × 20 kg = 400 kg). Shipping lines require Verified Gross Mass (VGM) compliance under SOLAS regulations; weight mismatch triggers port gate rejection.',
        recommendation:
          'Recalculate container VGM weight slip from weighbridge. Align the weight stated in Commercial Invoice, Packing List, and Shipping Bill.',
        status: 'OPEN',
        evidenceSnippet: 'Invoice: "Net Weight: 24,000.00 KGS" vs Packing List: "Total Net Weight: 23,600.00 KGS"',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'disc-date-003',
        shipmentId,
        field: 'Filing / Departure Date',
        category: 'DATES',
        severity: 'MEDIUM',
        riskScore: 40,
        docAId: 'doc-po-003',
        docAName: 'Purchase Order (PO-EUR-8831)',
        docAType: 'PURCHASE_ORDER',
        valueA: '2026-10-15',
        docBId: 'doc-sb-004',
        docBName: 'Shipping Bill (SB-COCHIN-49204)',
        docBType: 'SHIPPING_BILL',
        valueB: '2026-10-18',
        difference: '3-day dispatch schedule variance',
        explanation:
          'Purchase Order specifies maximum dispatch date of 2026-10-15, but Shipping Bill reflects vessel rotation date 2026-10-18. If buyer Letter of Credit (LC) contains a strict latest shipment clause, a 3-day delay could trigger bank discrepancy fees or payment dishonor.',
        recommendation:
          'Verify if buyer LC specifies 2026-10-15 as latest bill of lading date. If so, request an LC extension amendment from EuroSpice Imports B.V. immediately.',
        status: 'OPEN',
        evidenceSnippet: 'PO: "Expected dispatch by 15-Oct-2026" vs Shipping Bill: "Filing Date: 18-Oct-2026"',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const checklist: ChecklistItem[] = [
      {
        id: 'chk-doc-inv',
        shipmentId,
        category: 'DOCUMENTS',
        title: 'Commercial Invoice Present & Signed',
        description: 'Verified with invoice number, value, currency, and exporter declaration.',
        status: 'PASSED',
        assignedDoc: 'INV-2026-9042',
      },
      {
        id: 'chk-doc-pl',
        shipmentId,
        category: 'DOCUMENTS',
        title: 'Packing List Itemized',
        description: 'Complete breakdown of carton numbers, gross, and net weights.',
        status: 'PASSED',
        assignedDoc: 'PL-2026-9042',
      },
      {
        id: 'chk-doc-sb',
        shipmentId,
        category: 'DOCUMENTS',
        title: 'Customs Shipping Bill Filed',
        description: 'Electronic declaration lodged at Cochin Customs ICEGATE.',
        status: 'PASSED',
        assignedDoc: 'SB-COCHIN-49204',
      },
      {
        id: 'chk-doc-qc',
        shipmentId,
        category: 'DOCUMENTS',
        title: 'Quality & Phytosanitary Certificate',
        description: 'Spices Board India laboratory test report and fumigation clearance.',
        status: 'PASSED',
        assignedDoc: 'QC-SPICE-7731',
      },
      {
        id: 'chk-data-qty',
        shipmentId,
        category: 'DATA_CONSISTENCY',
        title: 'Quantity & Package Match',
        description: 'Commercial Invoice (1,200 ctns) vs Packing List (1,180 ctns).',
        status: 'FAILED',
      },
      {
        id: 'chk-data-wt',
        shipmentId,
        category: 'DATA_CONSISTENCY',
        title: 'Gross & Net Weight Alignment',
        description: 'Variance of 400 kg detected between Invoice and Packing List.',
        status: 'WARNING',
      },
      {
        id: 'chk-data-hs',
        shipmentId,
        category: 'DATA_CONSISTENCY',
        title: 'HS Code Uniformity (0904.11.10)',
        description: 'Harmonized System code matches across invoice, shipping bill, and QC.',
        status: 'PASSED',
      },
      {
        id: 'chk-comp-party',
        shipmentId,
        category: 'COMPLIANCE',
        title: 'Buyer & Consignee Identity KYC',
        description: 'EuroSpice Imports B.V. verified against European VAT register.',
        status: 'PASSED',
      },
      {
        id: 'chk-ver-human',
        shipmentId,
        category: 'VERIFICATION',
        title: 'Human Officer Resolution',
        description: 'Critical carton count and net weight discrepancies require sign-off.',
        status: 'PENDING',
      },
    ];

    const logs: AuditLogRecord[] = [
      {
        id: crypto.randomUUID(),
        shipmentId,
        userId,
        userName: 'Alby Mathew Joshy',
        action: 'SHIPMENT_INITIALIZED',
        resourceType: 'SHIPMENT',
        resourceId: shipmentId,
        newValue: { reference: demoRef, exporter: 'Malabar Spices & Agro Exports' },
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        shipmentId,
        userId,
        userName: 'EXPORTAI System',
        action: 'DOCUMENTS_PROCESSED',
        resourceType: 'DOCUMENT',
        resourceId: 'all-5-docs',
        newValue: { count: 5, models: 'gemini-3.8-flash' },
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        shipmentId,
        userId,
        userName: 'EXPORTAI Discrepancy Engine',
        action: 'DISCREPANCIES_DETECTED',
        resourceType: 'DISCREPANCY',
        resourceId: 'disc-carton-001',
        newValue: { count: 3, critical: 1, high: 1, medium: 1 },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    data.shipments.unshift(demoShipment);
    data.documents.push(...docs);
    data.discrepancies.push(...discrepancies);
    data.checklistItems.push(...checklist);
    data.auditLogs.unshift(...logs);

    // Initial VerifyAI greeting message
    data.assistantMessages[shipmentId] = [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          'Hello Officer Joshy. I am VerifyAI, your export documentation intelligence assistant for shipment EXP-KERALA-2026-001.\n\nI have cross-examined the 5 uploaded documents (Commercial Invoice, Packing List, Purchase Order, Shipping Bill, and Spices Board Quality Certificate). \n\n⚠️ Key Alert: I detected a critical 20-carton discrepancy between the Commercial Invoice (1,200 cartons) and Packing List (1,180 cartons), resulting in a 400 kg weight variance. Ask me any question regarding field cross-checks, customs compliance risks, or recommended actions.',
        timestamp: new Date().toISOString(),
      },
    ];

    await this.saveToFile();
    return shipmentId;
  }
}

export const db = new JsonDatabase();
