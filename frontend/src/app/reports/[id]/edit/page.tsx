"use client";
import { useState, useEffect, use } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import dynamic from "next/dynamic";
const PdfReviewer = dynamic(() => import("@/components/PdfReviewer").then(mod => mod.PdfReviewer), { ssr: false });

export default function AdvancedEditor({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/reports/${id}/annotations`);
        if (res.ok) {
          const data = await res.json();
          setAnnotations(data.annotations || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnotations();
  }, [id]);

  const handleSaveAnnotations = async (newAnnotations: any[]) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${id}/annotations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annotations: newAnnotations })
      });
      if (res.ok) {
        alert("រក្សាទុកមតិយោបល់បានជោគជ័យ! (Annotations saved)");
      } else {
        alert("មានបញ្ហាក្នុងការរក្សាទុក");
      }
    } catch (e) {
      console.error(e);
      alert("មានបញ្ហាក្នុងការរក្សាទុក");
    }
  };

  const pdfUrl = `http://localhost:8000/api/v1/reports/${id}/download`;

  if (isLoading) return <div className="p-10 text-center">កំពុងទាញយកទិន្នន័យ...</div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <a href="/reports" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </a>
          <h2 className="text-2xl font-bold tracking-tight">ត្រួតពិនិត្យឯកសារ (Document Review)</h2>
        </div>
        <div className="flex space-x-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-md border border-blue-100">
          <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
          <span>ដើម្បីកែប្រែទិន្នន័យ សូមត្រឡប់ទៅទំព័រដើម ហើយចុចប៊ូតុង "Edit Fields" (រូបខ្មៅដៃ)។</span>
        </div>
      </div>

      <div className="flex-1 bg-white border rounded-xl overflow-hidden shadow-inner flex flex-col min-h-[800px]">
        <PdfReviewer 
          pdfUrl={pdfUrl} 
          reportId={parseInt(id)} 
          initialAnnotations={annotations}
          onSave={handleSaveAnnotations}
        />
      </div>
    </div>
  );
}
