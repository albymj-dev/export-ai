'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { RiskBadge, StatusBadge, SeverityBadge } from '@/components/ui/RiskBadge';
import { ReadinessGauge } from '@/components/ui/ReadinessGauge';
import { DiscrepancyCard } from '@/components/verification/DiscrepancyCard';
import { ExecutiveSummaryCard } from '@/components/verification/ExecutiveSummaryCard';
import { VerifyAIAssistant } from '@/components/verification/VerifyAIAssistant';
import { ChecklistPanel } from '@/components/verification/ChecklistPanel';
import { DocumentUploader } from '@/components/verification/DocumentUploader';
import { EmailDraftModal } from '@/components/verification/EmailDraftModal';
import { AuditTimeline } from '@/components/verification/AuditTimeline';
import {
  ShipmentRecord,
  DocumentRecord,
  DiscrepancyRecord,
  ChecklistItem,
  RiskAnalysis,
  ExportReadiness,
  AuditLogRecord,
} from '@/types';
import {
  Ship,
  FileText,
  AlertOctagon,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
  Download,
  Mail,
  RefreshCw,
  Eye,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function ShipmentWorkspacePage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  const { shipmentId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab')?.toUpperCase();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'DISCREPANCIES' | 'DOCUMENTS' | 'VERIFY_AI' | 'CHECKLIST' | 'REPORT'
  >('OVERVIEW');

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'CHECKLIST') setActiveTab('CHECKLIST');
      else if (tabParam === 'DISCREPANCIES') setActiveTab('DISCREPANCIES');
      else if (tabParam === 'DOCUMENTS') setActiveTab('DOCUMENTS');
      else if (tabParam === 'VERIFY_AI' || tabParam === 'VERIFICATION') setActiveTab('VERIFY_AI');
      else if (tabParam === 'REPORT') setActiveTab('REPORT');
      else if (tabParam === 'OVERVIEW' || tabParam === 'ANALYSIS') setActiveTab('OVERVIEW');
    }
  }, [tabParam]);

  const [shipment, setShipment] = useState<ShipmentRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [readiness, setReadiness] = useState<ExportReadiness | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Email draft state
  const [emailModalDisc, setEmailModalDisc] = useState<DiscrepancyRecord | null>(null);

  // Selected document preview state
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const loadShipmentData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShipment(data.shipment);
        setDocuments(data.documents || []);
        setDiscrepancies(data.discrepancies || []);
        setChecklist(data.checklist || []);
        setRiskAnalysis(data.riskAnalysis);
        setReadiness(data.readiness);
        setAuditLogs(data.auditLogs || []);
        if (data.documents?.length > 0 && !selectedDocId) {
          setSelectedDocId(data.documents[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load shipment:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShipmentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  const handleResolveDiscrepancy = async (
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
        await loadShipmentData();
      }
    } catch (e) {
      console.error('Failed to resolve discrepancy:', e);
    }
  };

  const handleReprocessPipeline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/process`, {
        method: 'POST',
      });
      if (res.ok) {
        await loadShipmentData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !shipment) {
    return (
      <DashboardShell breadcrumbs={[{ label: 'Shipments', href: '/shipments' }, { label: 'Loading...' }]}>
        <div className="py-24 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Loading export verification dossier...</span>
        </div>
      </DashboardShell>
    );
  }

  if (!shipment) {
    return (
      <DashboardShell breadcrumbs={[{ label: 'Shipments', href: '/shipments' }, { label: 'Not Found' }]}>
        <div className="p-12 text-center text-slate-400 text-xs">Shipment not found.</div>
      </DashboardShell>
    );
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const criticalDiscCount = discrepancies.filter(
    (d) => d.severity === 'CRITICAL' && (d.status === 'OPEN' || d.status === 'IN_REVIEW')
  ).length;

  return (
    <DashboardShell
      breadcrumbs={[
        { label: 'Shipments', href: '/shipments' },
        { label: shipment.shipmentReference },
      ]}
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {shipment.shipmentReference}
              </span>
              <StatusBadge status={shipment.status} />
              <RiskBadge tier={shipment.riskTier} score={shipment.riskScore} />
            </div>

            <p className="text-xs text-slate-300">
              <strong className="text-white">{shipment.exporter}</strong> · Discharge: {shipment.destinationCountry} ({shipment.portOfDischarge})
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Port: <strong className="text-slate-200">{shipment.portOfLoading}</strong></span>
              <span>·</span>
              <span>Incoterms: <strong className="text-slate-200 font-mono">{shipment.incoterms}</strong></span>
              <span>·</span>
              <span>Departure: <strong className="text-slate-200 font-mono">{shipment.shipmentDate}</strong></span>
              <span>·</span>
              <span>Currency: <strong className="text-slate-200 font-mono">{shipment.currency}</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleReprocessPipeline}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Rerun comparison rules"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rerun Cross-Checks</span>
            </button>

            <button
              onClick={() => {
                if (discrepancies.length > 0) {
                  setEmailModalDisc(discrepancies[0]);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Draft Discrepancy Email</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[#070A0F] border border-slate-800/80 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'OVERVIEW', label: 'Overview & AI Summary', icon: Sparkles },
            {
              id: 'DISCREPANCIES',
              label: `Discrepancies (${discrepancies.length})`,
              icon: AlertOctagon,
              badge: criticalDiscCount > 0 ? `${criticalDiscCount} Critical` : undefined,
            },
            { id: 'VERIFY_AI', label: 'VerifyAI & Human Queue', icon: ShieldCheck },
            { id: 'DOCUMENTS', label: `Documents (${documents.length})`, icon: FileText },
            { id: 'CHECKLIST', label: 'Export Readiness', icon: CheckSquare },
            { id: 'REPORT', label: 'Report & Audit Dossier', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-red-950 border border-red-500/40 text-red-400 font-mono text-[10px] rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Executive Summary Card */}
              <div className="lg:col-span-2 space-y-6">
                <ExecutiveSummaryCard
                  shipmentId={shipment.id}
                  aiSummary={shipment.aiSummary}
                  onSummaryUpdated={loadShipmentData}
                />

                {/* Key Discrepancies Preview */}
                <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        CRITICAL DISCREPANCY HIGHLIGHTS
                      </h3>
                      <p className="text-xs text-slate-400">
                        Top priority documentation mismatches threatening customs clearance
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('DISCREPANCIES')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <span>Open Discrepancy Center</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {discrepancies.slice(0, 2).map((disc) => (
                      <DiscrepancyCard
                        key={disc.id}
                        discrepancy={disc}
                        onResolve={handleResolveDiscrepancy}
                        onDraftEmail={(d) => setEmailModalDisc(d)}
                      />
                    ))}
                    {discrepancies.length === 0 && (
                      <div className="p-8 text-center text-xs text-emerald-400">
                        ✓ All submitted documents are consistent! No discrepancies detected.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Readiness Gauge and Risk Factors */}
              <div className="space-y-6">
                {readiness && (
                  <ReadinessGauge
                    score={readiness.score}
                    status={readiness.status}
                    breakdown={readiness.breakdown}
                  />
                )}

                {/* Risk Factors Breakdown */}
                {riskAnalysis && (
                  <div className="p-5 bg-[#0B0F14] border border-slate-800/80 rounded-xl space-y-3.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
                      <span className="font-bold text-white uppercase tracking-wider">
                        Risk Score Math
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {riskAnalysis.score}/100
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {riskAnalysis.summary}
                    </p>

                    <div className="space-y-2 pt-1">
                      {riskAnalysis.factors.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-[#070A0F] rounded border border-slate-800/60 text-[11px]"
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

            {/* Export Readiness Pre-Clearance Checklist */}
            <div className="pt-2">
              <ChecklistPanel
                items={checklist}
                readinessScore={readiness?.score}
                readinessStatus={readiness?.status}
              />
            </div>
          </div>
        )}

        {/* Tab 2: DISCREPANCIES */}
        {activeTab === 'DISCREPANCIES' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Cross-Document Discrepancy Center
                </h2>
                <p className="text-xs text-slate-400">
                  Review side-by-side conflicting values, source evidence text, and AI recommendations
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-400">Total: {discrepancies.length}</span>
                <span>·</span>
                <span className="text-red-400 font-semibold font-mono">
                  {discrepancies.filter((d) => d.severity === 'CRITICAL').length} Critical
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  {discrepancies.filter((d) => d.status === 'RESOLVED' || d.status === 'VERIFIED').length} Resolved
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {discrepancies.map((disc) => (
                <DiscrepancyCard
                  key={disc.id}
                  discrepancy={disc}
                  onResolve={handleResolveDiscrepancy}
                  onDraftEmail={(d) => setEmailModalDisc(d)}
                />
              ))}

              {discrepancies.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs bg-[#0B0F14] border border-slate-800 rounded-xl space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-white">No Discrepancies Found</p>
                  <p className="text-slate-400">All fields and numbers across uploaded documents match perfectly.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: VERIFY_AI & HUMAN QUEUE */}
        {activeTab === 'VERIFY_AI' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VerifyAIAssistant
              shipmentId={shipment.id}
              shipmentRef={shipment.shipmentReference}
            />

            {/* Human Verification Action Queue */}
            <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  HUMAN VERIFICATION QUEUE
                </h3>
                <p className="text-xs text-slate-400">
                  Officer action required for unresolved variances
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
                            onClick={() => handleResolveDiscrepancy(d.id, 'ACCEPT_A', d.valueA, 'Officer confirmed value A')}
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
        )}

        {/* Tab 4: DOCUMENTS */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <DocumentUploader
              shipmentId={shipment.id}
              onUploadSuccess={loadShipmentData}
            />

            {/* Document Viewer & Extractions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Documents List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Uploaded Manifest Files ({documents.length})
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

              {/* Extracted Fields Explorer */}
              <div className="lg:col-span-2 bg-[#0B0F14] border border-slate-800/80 rounded-xl p-5 space-y-4">
                {selectedDoc?.extractedData ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          Extracted Structured Data: {selectedDoc.originalName}
                        </h4>
                        <p className="text-xs text-slate-400">
                          Classification: <strong className="text-cyan-400">{selectedDoc.documentType}</strong>
                        </p>
                      </div>

                      <a
                        href={`/api/shipments/${shipment.id}/documents/${selectedDoc.id}?download=true`}
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
                    Select a document to inspect its AI-extracted fields and evidence text.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: CHECKLIST */}
        {activeTab === 'CHECKLIST' && (
          <div className="space-y-6">
            <ChecklistPanel
              items={checklist}
              readinessScore={readiness?.score}
              readinessStatus={readiness?.status}
            />
          </div>
        )}

        {/* Tab 6: REPORT & AUDIT DOSSIER */}
        {activeTab === 'REPORT' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#0B0F14] border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Official Verification Certificate & Export Dossier
                </h3>
                <p className="text-xs text-slate-400">
                  Export structured compliance records for customs brokers, ICEGATE, or shipping lines
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href={`/api/shipments/${shipment.id}/report?format=json`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </a>

                <a
                  href={`/api/shipments/${shipment.id}/report?format=csv`}
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

            {/* Audit History Timeline */}
            <AuditTimeline logs={auditLogs} />
          </div>
        )}
      </div>

      {/* Email Draft Modal */}
      <EmailDraftModal
        shipmentId={shipment.id}
        discrepancy={emailModalDisc}
        isOpen={!!emailModalDisc}
        onClose={() => setEmailModalDisc(null)}
      />
    </DashboardShell>
  );
}
