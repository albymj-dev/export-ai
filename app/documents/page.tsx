'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DocumentRecord, ShipmentRecord } from '@/types';
import { FileText, Download, ExternalLink, Search, RefreshCw, FileCheck2 } from 'lucide-react';

export default function DocumentsExplorerPage() {
  const [documents, setDocuments] = useState<Array<DocumentRecord & { shipmentRef?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const sRes = await fetch('/api/shipments');
        const sData = await sRes.json();
        const shipments: ShipmentRecord[] = sData.shipments || [];

        const allDocs: Array<DocumentRecord & { shipmentRef?: string }> = [];
        for (const s of shipments) {
          const dRes = await fetch(`/api/shipments/${s.id}/documents`);
          if (dRes.ok) {
            const dData = await dRes.json();
            const docsWithRef = (dData.documents || []).map((d: DocumentRecord) => ({
              ...d,
              shipmentRef: s.shipmentReference,
            }));
            allDocs.push(...docsWithRef);
          }
        }
        setDocuments(allDocs);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = documents.filter((d) => {
    if (typeFilter !== 'ALL' && d.documentType !== typeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.originalName.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q) ||
      (d.shipmentRef && d.shipmentRef.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardShell
      breadcrumbs={[{ label: 'Documents' }]}
      onSearch={(q) => setSearchQuery(q)}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Export Documents Repository</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search and inspect all isolated manifest documents stored securely in .storage
          </p>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-[#0B0F14] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Document Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#05070A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="ALL">All Document Types</option>
              <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
              <option value="PACKING_LIST">Packing List</option>
              <option value="SHIPPING_BILL">Shipping Bill</option>
              <option value="PURCHASE_ORDER">Purchase Order</option>
              <option value="QUALITY_CERTIFICATE">Quality Certificate</option>
              <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin</option>
            </select>
          </div>
          <span className="text-slate-400">Total Files: {filtered.length}</span>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors flex flex-col justify-between text-xs space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {doc.documentType}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h4 className="font-semibold text-white truncate" title={doc.originalName}>
                  {doc.originalName}
                </h4>

                {doc.shipmentRef && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Shipment: <strong className="text-slate-300 font-mono">{doc.shipmentRef}</strong>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Structured & Verified
                </span>

                <Link
                  href={`/shipments/${doc.shipmentId}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>View in Workspace</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full p-12 text-center text-slate-400 text-xs">
              No export documents found matching your search.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
