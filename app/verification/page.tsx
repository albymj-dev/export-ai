'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DiscrepancyCard } from '@/components/verification/DiscrepancyCard';
import { EmailDraftModal } from '@/components/verification/EmailDraftModal';
import { DiscrepancyRecord, ShipmentRecord } from '@/types';
import { ShieldCheck, AlertOctagon, CheckCircle2, RefreshCw } from 'lucide-react';

export default function GlobalVerificationQueuePage() {
  const [discrepancies, setDiscrepancies] = useState<Array<DiscrepancyRecord & { shipmentRef?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailModalDisc, setEmailModalDisc] = useState<DiscrepancyRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sRes = await fetch('/api/shipments');
      const sData = await sRes.json();
      const shipments: ShipmentRecord[] = sData.shipments || [];

      const allDisc: Array<DiscrepancyRecord & { shipmentRef?: string }> = [];
      for (const s of shipments) {
        const dRes = await fetch(`/api/shipments/${s.id}`);
        if (dRes.ok) {
          const data = await dRes.json();
          const items = (data.discrepancies || []).map((d: DiscrepancyRecord) => ({
            ...d,
            shipmentRef: s.shipmentReference,
          }));
          allDisc.push(...items);
        }
      }
      setDiscrepancies(allDisc);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (
    id: string,
    action: string,
    verifiedValue?: any,
    reason?: string
  ) => {
    const target = discrepancies.find((d) => d.id === id);
    if (!target) return;

    try {
      await fetch(`/api/shipments/${target.shipmentId}/discrepancies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, verifiedValue, reason }),
      });
      await loadData();
    } catch (e) {
      console.error('Failed to resolve:', e);
    }
  };

  const openCount = discrepancies.filter((d) => d.status === 'OPEN' || d.status === 'IN_REVIEW').length;

  return (
    <DashboardShell breadcrumbs={[{ label: 'Verification Queue' }]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Global Verification Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active discrepancies across all export dossiers requiring human officer resolution
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-red-400 font-semibold font-mono">
              {openCount} Open Action Items
            </span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold font-mono">
              {discrepancies.length - openCount} Resolved
            </span>
            <button
              onClick={loadData}
              className="p-1.5 bg-[#0B0F14] border border-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {discrepancies.map((disc) => (
            <div key={disc.id} className="space-y-1">
              {disc.shipmentRef && (
                <div className="text-[11px] font-mono text-slate-400 px-1">
                  Shipment: <strong className="text-cyan-400">{disc.shipmentRef}</strong>
                </div>
              )}
              <DiscrepancyCard
                discrepancy={disc}
                onResolve={handleResolve}
                onDraftEmail={(d) => setEmailModalDisc(d)}
              />
            </div>
          ))}

          {discrepancies.length === 0 && !isLoading && (
            <div className="p-16 text-center text-slate-400 text-xs bg-[#0B0F14] border border-slate-800 rounded-xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="font-semibold text-white">Queue Empty</p>
              <p className="text-slate-400">All export document discrepancies are verified and resolved.</p>
            </div>
          )}
        </div>
      </div>

      <EmailDraftModal
        shipmentId={emailModalDisc?.shipmentId || ''}
        discrepancy={emailModalDisc}
        isOpen={!!emailModalDisc}
        onClose={() => setEmailModalDisc(null)}
      />
    </DashboardShell>
  );
}
