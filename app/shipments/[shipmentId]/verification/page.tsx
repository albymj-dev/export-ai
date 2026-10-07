'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { VerifyAIAssistant } from '@/components/verification/VerifyAIAssistant';
import { SeverityBadge, StatusBadge } from '@/components/ui/RiskBadge';
import { ShipmentRecord, DiscrepancyRecord } from '@/types';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ShipmentVerificationQueuePage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>([]);
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

  const handleResolve = async (id: string, action: string, val: any) => {
    try {
      await fetch(`/api/shipments/${shipmentId}/discrepancies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, verifiedValue: val, reason: 'Officer signed off' }),
      });
      await loadData();
    } catch (e) {
      console.error('Failed to sign off:', e);
    }
  };

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment?.shipmentReference || shipmentId, href: `/shipments/${shipmentId}` },
        { label: 'VerifyAI & Human Queue' },
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
              {shipment?.shipmentReference} · Verification Intelligence
            </h1>
            <p className="text-xs text-slate-300">
              Interactive VerifyAI Assistant and Human Officer Review Queue
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2 bg-[#05070A] border border-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VerifyAIAssistant
            shipmentId={shipmentId}
            shipmentRef={shipment?.shipmentReference || shipmentId}
          />

          <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                OFFICER SIGN-OFF QUEUE
              </h3>
              <p className="text-xs text-slate-400">
                Action items requiring explicit human verification
              </p>
            </div>

            <div className="space-y-3">
              {discrepancies.map((d) => {
                const isDone = d.status === 'RESOLVED' || d.status === 'VERIFIED';
                return (
                  <div
                    key={d.id}
                    className="p-3.5 bg-[#070A0F] border border-slate-800/80 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{d.field}</span>
                      <SeverityBadge severity={d.severity} />
                    </div>
                    <p className="text-slate-400 text-[11px]">{d.difference}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                      <StatusBadge status={d.status} />
                      {!isDone && (
                        <button
                          onClick={() => handleResolve(d.id, 'ACCEPT_A', d.valueA)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium cursor-pointer"
                        >
                          Sign-off Value A
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
