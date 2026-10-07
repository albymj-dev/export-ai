'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DiscrepancyCard } from '@/components/verification/DiscrepancyCard';
import { EmailDraftModal } from '@/components/verification/EmailDraftModal';
import { StatusBadge, RiskBadge } from '@/components/ui/RiskBadge';
import { ShipmentRecord, DiscrepancyRecord } from '@/types';
import { ArrowLeft, RefreshCw, AlertOctagon, ShieldCheck } from 'lucide-react';

export default function ShipmentDiscrepanciesPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>([]);
  const [emailModalDisc, setEmailModalDisc] = useState<DiscrepancyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
        setDiscrepancies(data.discrepancies || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  const handleResolve = async (
    id: string,
    action: string,
    verifiedValue?: any,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/discrepancies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, verifiedValue, reason }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error('Failed to resolve:', e);
    }
  };

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment?.shipmentReference || shipmentId, href: `/shipments/${shipmentId}` },
        { label: 'Discrepancy Center' },
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
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
                {shipment?.shipmentReference} · Cross-Document Discrepancies
              </h1>
              {shipment && <StatusBadge status={shipment.status} />}
              {shipment && <RiskBadge tier={shipment.riskTier} score={shipment.riskScore} />}
            </div>
            <p className="text-xs text-slate-300">
              Total {discrepancies.length} discrepancy(ies) detected across submitted manifest documents
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-[#05070A] border border-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-4">
          {discrepancies.map((disc) => (
            <DiscrepancyCard
              key={disc.id}
              discrepancy={disc}
              onResolve={handleResolve}
              onDraftEmail={(d) => setEmailModalDisc(d)}
            />
          ))}

          {discrepancies.length === 0 && !isLoading && (
            <div className="p-16 text-center text-slate-400 text-xs bg-[#0B0F14] border border-slate-800 rounded-xl space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white">No Discrepancies Found</p>
              <p className="text-slate-400">All submitted documents are 100% consistent.</p>
            </div>
          )}
        </div>
      </div>

      <EmailDraftModal
        shipmentId={shipmentId}
        discrepancy={emailModalDisc}
        isOpen={!!emailModalDisc}
        onClose={() => setEmailModalDisc(null)}
      />
    </DashboardShell>
  );
}
