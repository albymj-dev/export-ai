'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RiskBadge, StatusBadge } from '@/components/ui/RiskBadge';
import { ShipmentRecord, RiskTier } from '@/types';
import {
  Ship,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export default function ShipmentsListPage() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'RISK_HIGH' | 'RISK_LOW'>('RISK_HIGH');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/shipments');
        const data = await res.json();
        setShipments(data.shipments || []);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filtered = shipments
    .filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (riskFilter !== 'ALL' && s.riskTier !== riskFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.shipmentReference.toLowerCase().includes(q) ||
        s.exporter.toLowerCase().includes(q) ||
        s.buyer.toLowerCase().includes(q) ||
        s.portOfLoading.toLowerCase().includes(q) ||
        s.destinationCountry.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'OLDEST') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'RISK_HIGH') return b.riskScore - a.riskScore;
      if (sortBy === 'RISK_LOW') return a.riskScore - b.riskScore;
      return 0;
    });

  return (
    <DashboardShell
      breadcrumbs={[{ label: 'Shipments' }]}
      onSearch={(q) => setSearchQuery(q)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Export Shipments Directory</h1>
            <p className="text-xs text-slate-400 mt-1">
              Filter and review pre-clearance dossiers by compliance status and customs risk index
            </p>
          </div>

          <Link
            href="/shipments/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Shipment</span>
          </Link>
        </div>

        {/* Filters and Controls */}
        <div className="p-4 bg-[#0B0F14] border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#05070A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="EXPORT_READY">Export Ready</option>
                <option value="VERIFIED">Verified</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Risk Tier:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="bg-[#05070A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MODERATE">Moderate</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#05070A] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="RISK_HIGH">Highest Risk First</option>
              <option value="RISK_LOW">Lowest Risk First</option>
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/70">
          {filtered.map((shipment) => (
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
                  {shipment.exporter} → {shipment.destinationCountry} ({shipment.portOfDischarge})
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Incoterms: <strong className="text-slate-300 font-mono">{shipment.incoterms}</strong></span>
                  <span>·</span>
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
                        {shipment.criticalDiscrepancies} Critical Mismatches
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/shipments/${shipment.id}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Verification Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !isLoading && (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Ship className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-300">No shipments found matching criteria</p>
              <p className="text-[11px] text-slate-500">
                Try adjusting your search query, status filter, or create a new shipment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
