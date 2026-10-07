'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ChecklistPanel } from '@/components/verification/ChecklistPanel';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { RiskBadge, StatusBadge } from '@/components/ui/RiskBadge';
import { ShipmentRecord, ChecklistItem, RiskAnalysis, ExportReadiness } from '@/types';
import { RefreshCw, ArrowLeft, AlertOctagon, CheckSquare, ChevronRight } from 'lucide-react';

export default function ShipmentChecklistPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [readiness, setReadiness] = useState<ExportReadiness | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
        setChecklist(data.checklist || []);
        setReadiness(data.readiness);
        setRiskAnalysis(data.riskAnalysis);
      }
    } catch (e) {
      console.error('Failed to load checklist:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  if (isLoading && !shipment) {
    return (
      <DashboardShell
        breadcrumbs={[
          { label: 'Shipments', href: '/shipments' },
          { label: 'Checklist', href: `/shipments/${shipmentId}` },
        ]}
      >
        <div className="py-24 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Loading export readiness checklist...</span>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment?.shipmentReference || shipmentId, href: `/shipments/${shipmentId}` },
        { label: 'Export Readiness Checklist' },
      ]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/shipments/${shipmentId}`}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Workspace</span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
                {shipment?.shipmentReference} · Pre-Shipment Readiness
              </h1>
              {shipment && <StatusBadge status={shipment.status} />}
              {shipment && <RiskBadge tier={shipment.riskTier} score={shipment.riskScore} />}
            </div>
            <p className="text-xs text-slate-300">
              {shipment?.exporter} → {shipment?.destinationCountry} ({shipment?.portOfDischarge})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/shipments/${shipmentId}?tab=discrepancies`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>Resolve Discrepancies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Readiness Gauge & Factor Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {readiness && (
              <ReadinessGauge
                score={readiness.score}
                status={readiness.status}
                breakdown={readiness.breakdown}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            {riskAnalysis && (
              <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-4 text-xs h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                    <span className="font-bold text-white uppercase tracking-wider">
                      Customs Compliance Risk Evaluation
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      Index: {riskAnalysis.score}/100 ({riskAnalysis.tier})
                    </span>
                  </div>
                  <p className="text-slate-300 mt-3 leading-relaxed">
                    {riskAnalysis.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                    Contributing Factors & Deductions
                  </span>
                  {riskAnalysis.factors.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-[#070A0F] rounded-lg border border-slate-800/60 text-xs"
                    >
                      <span className="text-slate-300">{f.name}</span>
                      <span
                        className={`font-mono font-semibold ${
                          f.points > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {f.points > 0 ? `+${f.points}` : `${f.points}`} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* The Itemized Export Readiness Checklist */}
        <div className="space-y-4">
          <ChecklistPanel
            items={checklist}
            readinessScore={readiness?.score}
            readinessStatus={readiness?.status}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
