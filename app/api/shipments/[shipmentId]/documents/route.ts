import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import { GeminiService } from '@/lib/ai/gemini';
import { ComparisonEngine } from '@/lib/verification/comparison-engine';
import { RiskEngine } from '@/lib/verification/risk-engine';
import { DocumentRecord, DocumentType } from '@/types';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;
    const documents = await db.getDocuments(shipmentId);
    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch documents' }, { status: 500 });
  }
}

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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const specifiedType = (formData.get('documentType') as string) || 'AUTO';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Size limit check (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const userId = shipment.userId || 'user_officer_kerala';

    // 1. Identify Document Type
    let docType: DocumentType = 'OTHER';
    if (specifiedType !== 'AUTO' && specifiedType !== 'OTHER') {
      docType = specifiedType as DocumentType;
    } else {
      docType = await GeminiService.identifyDocumentType(file.name);
    }

    // 2. Save securely to private .storage abstraction layer
    const storedMeta = await storage.saveDocument(
      userId,
      shipmentId,
      file.name,
      buffer,
      file.type || 'application/octet-stream'
    );

    const docId = `doc-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const newDoc: DocumentRecord = {
      id: docId,
      shipmentId,
      userId,
      fileName: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/pdf',
      documentType: docType,
      storagePath: storedMeta.storageKey,
      uploadStatus: 'EXTRACTING',
      extractionStatus: 'IN_PROGRESS',
      createdAt: now,
      updatedAt: now,
    };

    await db.createDocument(newDoc);

    // 3. Run Gemini Extraction
    const extractedData = await GeminiService.extractDocument(
      buffer,
      newDoc.mimeType,
      newDoc.originalName,
      docType
    );

    const updatedDoc = await db.updateDocument(docId, {
      uploadStatus: 'COMPLETE',
      extractionStatus: 'COMPLETED',
      extractedData,
    });

    // 4. Run automated Cross-Check & Discrepancy Engine
    const allDocs = await db.getDocuments(shipmentId);
    const compResult = ComparisonEngine.runCrossCheck(shipmentId, allDocs);
    await db.setDiscrepancies(shipmentId, compResult.discrepancies);

    // 5. Calculate transparent Risk & Readiness
    const riskAnalysis = RiskEngine.calculateShipmentRisk(allDocs, compResult.discrepancies);
    const { readiness, checklist } = RiskEngine.calculateExportReadiness(allDocs, compResult.discrepancies);
    await db.setChecklist(shipmentId, checklist);

    const criticalCount = compResult.discrepancies.filter((d) => d.severity === 'CRITICAL').length;
    await db.updateShipment(shipmentId, {
      riskScore: riskAnalysis.score,
      riskTier: riskAnalysis.tier,
      exportReadinessScore: readiness.score,
      exportReadinessStatus: readiness.status,
      discrepancyCount: compResult.discrepancies.length,
      criticalDiscrepancies: criticalCount,
      status: compResult.discrepancies.length > 0 ? 'NEEDS_REVIEW' : 'VERIFIED',
    });

    // 6. Log Audit
    await db.logAudit({
      shipmentId,
      userId,
      userName: 'Verification Officer',
      action: 'DOCUMENT_UPLOADED_AND_EXTRACTED',
      resourceType: 'DOCUMENT',
      resourceId: docId,
      newValue: {
        fileName: file.name,
        type: docType,
        discrepanciesDetected: compResult.discrepancies.length,
      },
    });

    return NextResponse.json({
      document: updatedDoc,
      discrepancies: compResult.discrepancies,
      riskAnalysis,
      readiness,
    });
  } catch (error: any) {
    console.error('Error handling document upload:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
