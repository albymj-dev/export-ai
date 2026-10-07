'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RiskBadge, StatusBadge } from '@/components/ui/RiskBadge';
import { ShipmentRecord } from '@/types';
import {
  Ship,
  FileCheck2,
  AlertOctagon,
  Clock,
  Plus,
  RefreshCw,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function DashboardPage() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/shipments');
      const data = await res.json();
      setShipments(data.shipments || []);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalShipments = shipments.length;
  const pendingReview = shipments.filter(
    (s) => s.status === 'NEEDS_REVIEW' || s.status === 'DRAFT'
  ).length;
  const criticalCount = shipments.reduce((acc, s) => acc + (s.criticalDiscrepancies || 0), 0);
  const readyToExport = shipments.filter((s) => s.status === 'EXPORT_READY' || s.status === 'VERIFIED').length;

  const filteredShipments = shipments.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shipmentReference.toLowerCase().includes(q) ||
      s.exporter.toLowerCase().includes(q) ||
      s.buyer.toLowerCase().includes(q) ||
      s.destinationCountry.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell
      breadcrumbs={[{ label: 'Command Center' }]}
      onSearch={(q) => setSearchQuery(q)}
    >
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Good morning, Officer Joshy
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Your export document verification command center · Kerala Export Inspection Council
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 bg-[#0B0F14] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/shipments/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Shipment</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Shipments</span>
              <Ship className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {totalShipments}
            </div>
            <p className="text-[11px] text-slate-400">Active export dossiers</p>
          </div>

          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {pendingReview}
            </div>
            <p className="text-[11px] text-slate-400">Awaiting officer sign-off</p>
          </div>

          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Critical Discrepancies</span>
              <AlertOctagon className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-red-400 tabular-nums">
              {criticalCount}
            </div>
            <p className="text-[11px] text-slate-400">Customs hold risks</p>
          </div>

          <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Ready to Export</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {readyToExport}
            </div>
            <p className="text-[11px] text-slate-400">Compliant manifests</p>
          </div>
        </div>

        {/* Main Section: Active Shipments Grid / Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Active Export Shipments
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time status across commercial manifests and customs declarations
                </p>
              </div>
              <Link
                href="/shipments"
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>View All ({shipments.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/70">
              {filteredShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="p-5 hover:bg-[#10161E]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/shipments/${shipment.id}`}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors truncate"
                      >
                        {shipment.shipmentReference}
                      </Link>
                      <StatusBadge status={shipment.status} />
                    </div>

                    <p className="text-xs text-slate-300 truncate">
                      {shipment.exporter} → <span className="text-slate-400">{shipment.destinationCountry} ({shipment.portOfDischarge})</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Docs: <strong className="text-slate-200 font-mono">{shipment.documentCount}</strong></span>
                      <span>·</span>
                      <RiskBadge tier={shipment.riskTier} score={shipment.riskScore} />
                      <span>·</span>
                      <span>
                        Readiness: <strong className="text-cyan-400 font-mono">{shipment.exportReadinessScore}%</strong>
                      </span>
                      {shipment.criticalDiscrepancies > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-red-400 font-semibold font-mono">
                            {shipment.criticalDiscrepancies} Critical
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/shipments/${shipment.id}`}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {filteredShipments.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No shipments matching your filter.
                </div>
              )}
            </div>
          </div>

          {/* AI Verification Activity Panel */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                AI Verification Activity
              </h3>
              <p className="text-xs text-slate-400">
                Continuous reconciliation and model inference events
              </p>
            </div>

            <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-3.5 text-xs">
              {[
                {
                  title: 'Commercial Invoice INV-2026-9042 Analyzed',
                  desc: 'Extracted 1,200 cartons, $144,000 CIF value with 99% confidence.',
                  time: '12m ago',
                  type: 'success',
                },
                {
                  title: 'Carton Mismatch Detected in EXP-KERALA-2026-001',
                  desc: 'Invoice states 1,200 cartons; Packing List states 1,180 cartons (Diff: 20 ctns).',
                  time: '24m ago',
                  type: 'critical',
                },
                {
                  title: 'SOLAS Weight Tolerance Check Run',
                  desc: '400 kg gross weight discrepancy flagged between documents.',
                  time: '38m ago',
                  type: 'warning',
                },
                {
                  title: 'HS Code 0904.11.10 Harmonized Across 3 Forms',
                  desc: 'Tellicherry Extra Bold Black Pepper tariff classification verified.',
                  time: '1h ago',
                  type: 'success',
                },
                {
                  title: 'Phytosanitary & Fumigation Cert Verified',
                  desc: 'Spices Board India Quality Certificate QC-SPICE-7731 authenticated.',
                  time: '1.5h ago',
                  type: 'success',
                },
              ].map((act, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#070A0F] border border-slate-800/60 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{act.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
