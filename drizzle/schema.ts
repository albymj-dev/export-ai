import { pgTable, text, timestamp, integer, boolean, jsonb, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').default('VERIFICATION_OFFICER'),
  organization: text('organization').default('Export Compliance Bureau'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  shipmentReference: text('shipment_reference').notNull().unique(),
  exporter: text('exporter').notNull(),
  buyer: text('buyer').notNull(),
  consignee: text('consignee').notNull(),
  countryOfOrigin: text('country_of_origin').notNull(),
  destinationCountry: text('destination_country').notNull(),
  portOfLoading: text('port_of_loading').notNull(),
  portOfDischarge: text('port_of_discharge').notNull(),
  shipmentDate: text('shipment_date').notNull(),
  incoterms: text('incoterms').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('DRAFT'),
  riskScore: integer('risk_score').notNull().default(0),
  riskTier: text('risk_tier').notNull().default('LOW'),
  exportReadinessScore: integer('export_readiness_score').notNull().default(0),
  exportReadinessStatus: text('export_readiness_status').notNull().default('NEEDS_REVIEW'),
  documentCount: integer('document_count').notNull().default(0),
  discrepancyCount: integer('discrepancy_count').notNull().default(0),
  criticalDiscrepancies: integer('critical_discrepancies').notNull().default(0),
  aiSummary: jsonb('ai_summary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id').notNull(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  documentType: text('document_type').notNull().default('OTHER'),
  storagePath: text('storage_path').notNull(),
  uploadStatus: text('upload_status').notNull().default('UPLOADED'),
  extractionStatus: text('extraction_status').notNull().default('PENDING'),
  extractedData: jsonb('extracted_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const discrepancies = pgTable('discrepancies', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id').notNull(),
  field: text('field').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull().default('MEDIUM'),
  riskScore: integer('risk_score').notNull().default(50),
  docAId: text('doc_a_id').notNull(),
  docAName: text('doc_a_name').notNull(),
  docAType: text('doc_a_type').notNull(),
  valueA: text('value_a').notNull(),
  docBId: text('doc_b_id').notNull(),
  docBName: text('doc_b_name').notNull(),
  docBType: text('doc_b_type').notNull(),
  valueB: text('value_b').notNull(),
  difference: text('difference').notNull(),
  explanation: text('explanation').notNull(),
  recommendation: text('recommendation').notNull(),
  status: text('status').notNull().default('OPEN'),
  humanResolution: jsonb('human_resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const checklistItems = pgTable('checklist_items', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id'),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  previousValue: jsonb('previous_value'),
  newValue: jsonb('new_value'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const emailDrafts = pgTable('email_drafts', {
  id: text('id').primaryKey(),
  shipmentId: text('shipment_id').notNull(),
  recipientRole: text('recipient_role').notNull(),
  recipientEmail: text('recipient_email'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  discrepancyIds: jsonb('discrepancy_ids'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
