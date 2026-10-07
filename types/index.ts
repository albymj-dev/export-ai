export type DocumentType =
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'SHIPPING_BILL'
  | 'PURCHASE_ORDER'
  | 'QUALITY_CERTIFICATE'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'BILL_OF_LADING'
  | 'OTHER';

export type ShipmentStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'ANALYSIS_COMPLETE'
  | 'NEEDS_REVIEW'
  | 'VERIFIED'
  | 'EXPORT_READY'
  | 'BLOCKED';

export type DiscrepancySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DiscrepancyStatus = 'OPEN' | 'IN_REVIEW' | 'VERIFIED' | 'RESOLVED' | 'REJECTED';

export type RiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface FieldEvidence<T = any> {
  value: T | null;
  confidence: number;
  page: number;
  evidence: string;
  needsReview?: boolean;
}

export interface ExtractedDocumentData {
  documentType: DocumentType;
  documentNumber: FieldEvidence<string>;
  issueDate: FieldEvidence<string>;
  seller: FieldEvidence<string>;
  buyer: FieldEvidence<string>;
  consignee: FieldEvidence<string>;
  productDescription: FieldEvidence<string>;
  hsCode: FieldEvidence<string>;
  quantity: FieldEvidence<number>;
  quantityUnit: FieldEvidence<string>;
  cartonCount: FieldEvidence<number>;
  grossWeight: FieldEvidence<number>;
  netWeight: FieldEvidence<number>;
  weightUnit: FieldEvidence<string>;
  unitPrice: FieldEvidence<number>;
  totalValue: FieldEvidence<number>;
  currency: FieldEvidence<string>;
  countryOfOrigin: FieldEvidence<string>;
  destinationCountry: FieldEvidence<string>;
  portOfLoading: FieldEvidence<string>;
  portOfDischarge: FieldEvidence<string>;
  vessel: FieldEvidence<string>;
  containerNumbers: FieldEvidence<string[]>;
  purchaseOrderNumber: FieldEvidence<string>;
  shippingBillNumber: FieldEvidence<string>;
  invoiceNumber: FieldEvidence<string>;
  certificationNumbers: FieldEvidence<string[]>;
  rawSummary?: string;
}

export interface DocumentRecord {
  id: string;
  shipmentId: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  storagePath: string;
  uploadStatus: 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'EXTRACTING' | 'ANALYZING' | 'COMPLETE' | 'NEEDS_REVIEW' | 'FAILED';
  extractionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  extractedData?: ExtractedDocumentData;
  createdAt: string;
  updatedAt: string;
}

export interface DiscrepancyRecord {
  id: string;
  shipmentId: string;
  field: string;
  category: 'IDENTITY' | 'QUANTITY' | 'WEIGHT' | 'PRODUCT' | 'FINANCIAL' | 'SHIPMENT' | 'DATES' | 'REFERENCES' | 'COMPLIANCE';
  severity: DiscrepancySeverity;
  riskScore: number;
  docAId: string;
  docAName: string;
  docAType: DocumentType;
  valueA: string | number;
  docBId: string;
  docBName: string;
  docBType: DocumentType;
  valueB: string | number;
  difference: string;
  explanation: string;
  recommendation: string;
  status: DiscrepancyStatus;
  humanResolution?: {
    verifiedValue?: string | number;
    resolvedBy?: string;
    resolvedAt?: string;
    reason?: string;
    action?: 'ACCEPT_A' | 'ACCEPT_B' | 'MANUAL_CORRECTION' | 'REJECT_MISMATCH' | 'REQUEST_AMENDMENT';
  };
  evidenceSnippet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonRecord {
  id: string;
  shipmentId: string;
  category: string;
  field: string;
  docAType: DocumentType;
  docANumber: string;
  valueA: string;
  docBType: DocumentType;
  docBNumber: string;
  valueB: string;
  matchStatus: 'MATCH' | 'MISMATCH' | 'PARTIAL' | 'NOT_APPLICABLE';
  severity: DiscrepancySeverity;
  difference?: string;
  discrepancyId?: string;
}

export interface RiskAnalysis {
  score: number; // 0 - 100
  tier: RiskTier;
  summary: string;
  factors: {
    name: string;
    weight: number;
    impact: string;
    points: number;
  }[];
}

export interface ExportReadiness {
  score: number; // 0 - 100%
  status: 'EXPORT_READY' | 'NEEDS_REVIEW' | 'BLOCKED';
  breakdown: {
    documentsComplete: number; // 0-100
    dataConsistency: number; // 0-100
    complianceFields: number; // 0-100
    criticalIssues: number; // 0-100
    humanVerification: number; // 0-100
  };
}

export interface ChecklistItem {
  id: string;
  shipmentId: string;
  category: 'DOCUMENTS' | 'DATA_CONSISTENCY' | 'COMPLIANCE' | 'VERIFICATION';
  title: string;
  description: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'PENDING';
  assignedDoc?: string;
}

export interface ShipmentRecord {
  id: string;
  userId: string;
  shipmentReference: string;
  exporter: string;
  buyer: string;
  consignee: string;
  countryOfOrigin: string;
  destinationCountry: string;
  portOfLoading: string;
  portOfDischarge: string;
  shipmentDate: string;
  incoterms: string;
  currency: string;
  status: ShipmentStatus;
  riskScore: number;
  riskTier: RiskTier;
  exportReadinessScore: number;
  exportReadinessStatus: 'EXPORT_READY' | 'NEEDS_REVIEW' | 'BLOCKED';
  documentCount: number;
  discrepancyCount: number;
  criticalDiscrepancies: number;
  aiSummary?: {
    overview: string;
    keyFindings: string[];
    recommendations: string[];
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  shipmentId?: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: 'SHIPMENT' | 'DOCUMENT' | 'DISCREPANCY' | 'VERIFICATION' | 'REPORT';
  resourceId: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface EmailDraft {
  id: string;
  shipmentId: string;
  recipientRole: 'SUPPLIER' | 'BUYER' | 'CUSTOMS_BROKER' | 'DOCUMENTATION_TEAM';
  recipientEmail?: string;
  subject: string;
  body: string;
  discrepancyIds: string[];
  generatedAt: string;
}

export interface VerificationAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  evidenceReferences?: {
    document: string;
    field: string;
    value: string;
  }[];
}
