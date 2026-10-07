import React from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertOctagon,
  FileText,
  Layers,
  Scale,
  Cpu,
  CheckCircle2,
  Check,
  Ship,
  ChevronRight,
  Database,
  Search,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 3-Zone Top Bar Contract */}
      <header className="h-16 px-6 md:px-12 border-b border-slate-800/80 bg-[#070A0F]/80 backdrop-blur sticky top-0 z-50 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#070A0F] rounded-[7px] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <span className="font-bold text-base tracking-wider text-white">EXPORTAI</span>
        </Link>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
          <a href="#architecture" className="hover:text-white transition-colors">3-Layer Architecture</a>
          <a href="#documents" className="hover:text-white transition-colors">Supported Documents</a>
          <a href="#demo" className="hover:text-white transition-colors">Discrepancy Engine</a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Launch Command Center
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 md:px-12 max-w-6xl mx-auto text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-800/40 text-blue-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>IBM × Kerala Government Hackathon 2026 · Challenge 3</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          AI-Powered Export Document Verification
        </h1>

        <p className="mt-5 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Detect discrepancies across export documents before they become customs delays, port detention penalties, or costly compliance violations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shipments/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <span>Start Verification</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-[#0B0F14] hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <Ship className="w-4 h-4 text-cyan-400" />
            <span>Load Kerala Demo (EXP-KERALA-2026-001)</span>
          </Link>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
          Verify every document. Ship with confidence.
        </p>

        {/* Visual Pipeline Showcase */}
        <div id="pipeline" className="mt-16 p-6 bg-[#0B0F14] border border-slate-800/80 rounded-2xl text-left relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/70 text-xs">
            <span className="font-semibold text-white tracking-wide uppercase">
              End-to-End Verification Pipeline
            </span>
            <span className="font-mono text-emerald-400">Zero-Hallucination Grounding</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
            {[
              { step: '01', title: 'Document Upload', desc: 'Private .storage isolation & MIME validation' },
              { step: '02', title: 'AI Extraction', desc: 'Gemini structured multimodal field parsing' },
              { step: '03', title: 'Cross-Check Engine', desc: 'Deterministic unit & quantity reconciliation' },
              { step: '04', title: 'Risk Calculation', desc: 'Transparent 0–100 customs penalty scoring' },
              { step: '05', title: 'Human Verification', desc: 'Audit-logged officer sign-off & correction' },
              { step: '06', title: 'Export Ready', desc: 'Verified certificate & customs clearance dossier' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#070A0F] border border-slate-800/70 rounded-xl relative group hover:border-blue-500/40 transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-cyan-400">{p.step}</span>
                <h4 className="text-xs font-bold text-white mt-1">{p.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Discrepancy Showcase Section */}
      <section id="demo" className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            The Exact Problem EXPORTAI Solves
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Different teams create documents at different times. A 20-carton discrepancy between Commercial Invoice and Packing List leads to port detention.
          </p>
        </div>

        {/* Live discrepancy mock card */}
        <div className="border border-red-500/30 bg-[#0B0F14] rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-950/40 border border-red-500/40 text-red-400 font-mono text-xs font-bold rounded">
                CRITICAL DISCREPANCY
              </span>
              <span className="text-sm font-bold text-white">Carton Count & Package Tally</span>
            </div>
            <span className="text-xs font-mono text-red-400 font-semibold">
              Risk Index: 85/100 · Port Detention Risk
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            <div className="p-4 bg-[#05070A] border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Commercial Invoice (INV-2026-9042)</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">1,200 cartons</div>
              <div className="text-[11px] text-slate-500 mt-2 italic">
                Source Page 1: &quot;Total Quantity: 1,200 Cartons (USD 144,000)&quot;
              </div>
            </div>

            <div className="p-4 bg-[#05070A] border border-slate-800 rounded-xl">
              <div className="text-xs text-slate-400">Packing List (PL-2026-9042)</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">1,180 cartons</div>
              <div className="text-[11px] text-slate-500 mt-2 italic">
                Source Page 1: &quot;Total Cartons Packed: 1,180 Cartons (Net: 23,600 kg)&quot;
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-red-950/15 border border-red-900/30 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-red-400 font-semibold">
              <AlertOctagon className="w-4 h-4" />
              <span>Difference: 20 cartons variance (400 kg gross weight discrepancy)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Customs officers at Cochin Port and Rotterdam will flag this discrepancy during physical container tally. Misdeclaration penalties or cargo hold will be triggered without packing declaration amendment.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              AI Recommendation: Verify physical CFS count and amend documentation before ICEGATE filing.
            </span>
            <Link
              href="/dashboard"
              className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1"
            >
              <span>Inspect in Command Center</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Layer Architecture */}
      <section id="architecture" className="py-16 px-6 md:px-12 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
            Engineering Precision
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            Three-Layer Reliability Architecture
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            AI should not perform everything. We separate document intelligence, deterministic rule-based checks, and reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0B0F14] border border-slate-800 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Layer 1: Document Intelligence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini extracts structured data, isolates page evidence, and classifies document types without hallucinating missing values.
            </p>
          </div>

          <div className="p-6 bg-[#0B0F14] border border-slate-800 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Layer 2: Deterministic Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardizes units (kg, MT), currencies (USD, EUR), numbers, and HS codes. Calculates exact mathematical differences deterministically.
            </p>
          </div>

          <div className="p-6 bg-[#0B0F14] border border-slate-800 rounded-xl space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Layer 3: AI Reasoning
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes executive summaries, drafts precise rectification emails to suppliers, and powers the interactive VerifyAI assistant.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section id="documents" className="py-16 px-6 md:px-12 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Supported Export Documents
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Cross-checks every document against the rest of the shipment dossier
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            'Commercial Invoice',
            'Packing List',
            'Customs Shipping Bill',
            'Purchase Order (PO)',
            'Quality & Phyto Certificate',
            'Certificate of Origin (COO)',
            'Bill of Lading (B/L)',
            'Fumigation & Inspection Slip',
          ].map((doc, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0B0F14] border border-slate-800/80 rounded-lg flex items-center gap-2.5 text-slate-200"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{doc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 border-t border-slate-800/80 bg-[#070A0F] text-center px-6">
        <h3 className="text-xl font-bold text-white">Ready to verify export shipments?</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Built for the IBM × Kerala Government Hackathon 2026. Try the live demo with full cross-checks now.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Launch EXPORTAI
          </Link>
        </div>
        <p className="text-[11px] text-slate-500 mt-8 font-mono">
          EXPORTAI · Enterprise Pre-Shipment Document Intelligence Platform
        </p>
      </footer>
    </div>
  );
}
