'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AuditTimeline } from '@/components/verification/AuditTimeline';
import { ShipmentRecord, AuditLogRecord } from '@/types';
import { ArrowLeft, Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function ShipmentReportPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
        setAuditLogs(data.auditLogs || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment?.shipmentReference || shipmentId, href: `/shipments/${shipmentId}` },
        { label: 'Official Dossier & Report' },
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
              {shipment?.shipmentReference} · Verification Audit Dossier
            </h1>
            <p className="text-xs text-slate-300">
              Download certificates or inspect full tamper-evident audit history
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <a
              href={`/api/shipments/${shipmentId}/report?format=json`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </a>

            <a
              href={`/api/shipments/${shipmentId}/report?format=csv`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>

        <AuditTimeline logs={auditLogs} />
      </div>
    </DashboardShell>
  );
}
