import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shipmentId: string; documentId: string }> }
) {
  try {
    const { shipmentId, documentId } = await params;
    const doc = await db.getDocumentById(documentId);
    if (!doc || doc.shipmentId !== shipmentId) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const download = searchParams.get('download') === 'true';

    // Retrieve from private .storage
    const fileData = await storage.getDocument(doc.storagePath);
    if (!fileData) {
      // If binary not on disk (e.g. demo document), return extracted structured preview
      return NextResponse.json({
        document: doc,
        note: 'Binary preview not stored on disk; structured intelligence available.',
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', fileData.mimeType);
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName)}"`);
    } else {
      headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    }

    return new NextResponse(new Uint8Array(fileData.buffer), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve document' }, { status: 500 });
  }
}
