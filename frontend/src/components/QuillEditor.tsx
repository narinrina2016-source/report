"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const QuillEditorInner = dynamic(() => import('./QuillEditorInner'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500 border rounded min-h-[200px] flex items-center justify-center">កំពុងទាញយកកម្មវិធីកែសម្រួល...</div>
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function QuillEditor(props: QuillEditorProps) {
  return <QuillEditorInner {...props} />;
}
