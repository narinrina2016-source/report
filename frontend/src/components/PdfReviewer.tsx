"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const PdfReviewerInner = dynamic(() => import('./PdfReviewerInner').then(mod => mod.PdfReviewerInner), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500 border rounded min-h-[500px] flex items-center justify-center bg-gray-50">កំពុងទាញយកកម្មវិធីអាន PDF...</div>
});

interface PdfReviewerProps {
  pdfUrl: string;
  reportId: number;
  initialAnnotations?: any[];
  onSave?: (annotations: any[]) => void;
  readOnly?: boolean;
}

export function PdfReviewer(props: PdfReviewerProps) {
  return <PdfReviewerInner {...props} />;
}
