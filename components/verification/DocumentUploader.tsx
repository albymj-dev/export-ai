'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { DocumentType } from '@/types';

export function DocumentUploader({
  shipmentId,
  onUploadSuccess,
}: {
  shipmentId: string;
  onUploadSuccess?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('AUTO');
  const [uploadQueue, setUploadQueue] = useState<Array<{ name: string; size: number; status: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes: Array<{ value: string; label: string }> = [
    { value: 'AUTO', label: '✦ Let AI Identify Document Type' },
    { value: 'COMMERCIAL_INVOICE', label: 'Commercial Invoice' },
    { value: 'PACKING_LIST', label: 'Packing List' },
    { value: 'SHIPPING_BILL', label: 'Shipping Bill' },
    { value: 'PURCHASE_ORDER', label: 'Purchase Order' },
    { value: 'QUALITY_CERTIFICATE', label: 'Quality / Phyto Certificate' },
    { value: 'CERTIFICATE_OF_ORIGIN', label: 'Certificate of Origin' },
    { value: 'OTHER', label: 'Other Manifest Document' },
  ];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size,
      status: 'Uploading...',
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', selectedType);

      try {
        const res = await fetch(`/api/shipments/${shipmentId}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.name === file.name ? { ...item, status: 'Extracted & Verified' } : item
            )
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.name === file.name ? { ...item, status: 'Upload Error' } : item
            )
          );
        }
      } catch (e) {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.name === file.name ? { ...item, status: 'Failed' } : item
          )
        );
      }
    }

    setIsUploading(false);
    onUploadSuccess?.();
  };

  return (
    <div className="bg-[#0B0F14] border border-slate-800/80 rounded-xl p-5 space-y-4">
      {/* Classification Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
        <div>
          <h4 className="text-sm font-semibold text-white">Upload Export Documents</h4>
          <p className="text-xs text-slate-400">PDF, PNG, JPG, or WEBP (Max 25MB each)</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Classification:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#05070A] border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {documentTypes.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-950/20'
            : 'border-slate-800 hover:border-slate-700 bg-[#070A0F]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-sm font-semibold text-slate-200">
          Drag and drop export documents here, or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports Commercial Invoice, Packing List, Shipping Bill, PO, and Quality Certificates
        </p>
      </div>

      {/* Queue feedback */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-400">Recent Upload Activity</div>
          <div className="space-y-1.5">
            {uploadQueue.slice(-4).map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 bg-[#05070A] border border-slate-800/80 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-200 truncate">{q.name}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({(q.size / 1024).toFixed(0)} KB)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium shrink-0">
                  {q.status === 'Extracted & Verified' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Extracted
                    </span>
                  ) : q.status.includes('Error') || q.status === 'Failed' ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Failed
                    </span>
                  ) : (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
