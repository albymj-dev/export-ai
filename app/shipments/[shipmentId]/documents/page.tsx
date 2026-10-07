'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DocumentUploader } from '@/components/verification/DocumentUploader';
import { ShipmentRecord, DocumentRecord } from '@/types';
import { ArrowLeft, RefreshCw, FileText, Download, FileCheck2 } from 'lucide-react';

export default function ShipmentDocumentsPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
        setDocuments(data.documents || []);
        if (data.documents?.length > 0 && !selectedDocId) {
          setSelectedDocId(data.documents[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment?.shipmentReference || shipmentId, href: `/shipments/${shipmentId}` },
        { label: 'Documents' },
      ]}
    >
      <div className="space-y-6">
        <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Link
              href={`/shipments/${shipmentId}`}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace</span>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
              {shipment?.shipmentReference} · Manifest Documents
            </h1>
            <p className="text-xs text-slate-300">
              {documents.length} document(s) uploaded and extracted with Gemini AI
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-[#05070A] border border-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Upload Zone */}
        <DocumentUploader shipmentId={shipmentId} onUploadSuccess={loadData} />

        {/* Documents Grid / Extractions Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Uploaded Files ({documents.length})
            </h4>
            {documents.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/40 text-white'
                      : 'bg-[#0B0F14] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold truncate">
                    <span className="truncate">{doc.originalName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="font-mono text-cyan-400">{doc.documentType}</span>
                    <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2 bg-[#0B0F14] border border-slate-800/80 rounded-xl p-5 space-y-4">
            {selectedDoc?.extractedData ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Extracted Fields: {selectedDoc.originalName}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Type: <strong className="text-cyan-400">{selectedDoc.documentType}</strong>
                    </p>
                  </div>
                  <a
                    href={`/api/shipments/${shipmentId}/documents/${selectedDoc.id}?download=true`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs max-h-[500px] overflow-y-auto pr-1">
                  {Object.entries(selectedDoc.extractedData).map(([key, val]: [string, any]) => {
                    if (key === 'rawSummary' || key === 'documentType') return null;
                    if (!val || typeof val !== 'object') return null;

                    const displayVal = val.value !== null && val.value !== undefined ? String(val.value) : '—';
                    return (
                      <div
                        key={key}
                        className="p-3 bg-[#070A0F] border border-slate-800/70 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase">
                          <span>{key}</span>
                          {val.confidence && (
                            <span className="text-cyan-400">
                              {(val.confidence * 100).toFixed(0)}% Conf
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-white break-words">
                          {displayVal}
                        </div>
                        {val.evidence && (
                          <p className="text-[10px] text-slate-500 italic truncate" title={val.evidence}>
                            &quot;{val.evidence}&quot;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a document to inspect its extracted parameters.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
