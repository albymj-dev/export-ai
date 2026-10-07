'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { DocumentUploader } from '@/components/verification/DocumentUploader';
import { AIProcessingAnimation } from '@/components/verification/AIProcessingAnimation';
import {
  Ship,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function NewShipmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    shipmentReference: 'EXP-2026-9042',
    exporter: 'Malabar Spices & Agro Exports Pvt. Ltd., Kochi, Kerala',
    buyer: 'EuroSpice Imports B.V., Rotterdam, Netherlands',
    consignee: 'EuroSpice Logistics Hub, Maasvlakte, Rotterdam',
    countryOfOrigin: 'India (Kerala)',
    destinationCountry: 'Netherlands',
    portOfLoading: 'Cochin Port (INCOK)',
    portOfDischarge: 'Port of Rotterdam (NLRTM)',
    shipmentDate: new Date().toISOString().split('T')[0],
    incoterms: 'CIF Rotterdam',
    currency: 'USD',
  });

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedShipmentId(data.shipment.id);
        setCurrentStep(2);
      }
    } catch (err) {
      console.error('Failed to create shipment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishUpload = async () => {
    if (!createdShipmentId) return;
    setCurrentStep(3); // Go to animated scanning screen
  };

  return (
    <DashboardShell
      breadcrumbs={[{ label: 'Shipments', href: '/shipments' }, { label: 'New Shipment' }]}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Wizard Progress Bar */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Export Shipment</h1>
          <p className="text-xs text-slate-400 mt-1">
            Initiate automated multimodal document verification and compliance check
          </p>

          <div className="mt-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                1
              </span>
              <span className={currentStep === 1 ? 'font-semibold text-white' : 'text-slate-400'}>
                Shipment Information
              </span>
            </div>

            <div className="h-[1px] flex-1 mx-4 bg-slate-800" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                2
              </span>
              <span className={currentStep === 2 ? 'font-semibold text-white' : 'text-slate-400'}>
                Upload Manifest Documents
              </span>
            </div>

            <div className="h-[1px] flex-1 mx-4 bg-slate-800" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentStep === 3 ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </span>
              <span className={currentStep === 3 ? 'font-semibold text-white' : 'text-slate-400'}>
                AI Reconciliation
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Shipment Basic Info */}
        {currentStep === 1 && (
          <form
            onSubmit={handleStep1Submit}
            className="p-6 md:p-8 bg-[#0B0F14] border border-slate-800/80 rounded-2xl space-y-6 text-xs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Shipment Reference / Manifest ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shipmentReference}
                  onChange={(e) => setFormData({ ...formData, shipmentReference: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Incoterms *</label>
                <input
                  type="text"
                  required
                  value={formData.incoterms}
                  onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                  placeholder="e.g. CIF Rotterdam, FOB Cochin"
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">
                  Exporter / Shipper Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.exporter}
                  onChange={(e) => setFormData({ ...formData, exporter: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Buyer / Importer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.buyer}
                  onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Consignee / Delivery Hub *
                </label>
                <input
                  type="text"
                  required
                  value={formData.consignee}
                  onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Country of Origin *</label>
                <input
                  type="text"
                  required
                  value={formData.countryOfOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Destination Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.destinationCountry}
                  onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Port of Loading *</label>
                <input
                  type="text"
                  required
                  value={formData.portOfLoading}
                  onChange={(e) => setFormData({ ...formData, portOfLoading: e.target.value })}
                  placeholder="e.g. Cochin Port (INCOK)"
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Port of Discharge *
                </label>
                <input
                  type="text"
                  required
                  value={formData.portOfDischarge}
                  onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                  placeholder="e.g. Port of Rotterdam (NLRTM)"
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Target Shipment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.shipmentDate}
                  onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-[#05070A] border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <span>Proceed to Document Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Upload Documents */}
        {currentStep === 2 && createdShipmentId && (
          <div className="space-y-6">
            <DocumentUploader shipmentId={createdShipmentId} />

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleFinishUpload}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                <span>Run AI Reconciliation & Verification</span>
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Animated Scanning Screen */}
        {currentStep === 3 && createdShipmentId && (
          <div className="space-y-6">
            <AIProcessingAnimation
              isAnalyzing={true}
              onComplete={() => {
                router.push(`/shipments/${createdShipmentId}`);
              }}
            />

            <div className="text-center text-xs text-slate-400">
              Cross-document comparison engine running deterministically across uploaded files...
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
