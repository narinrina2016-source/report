"use client";
import { useState, useEffect } from "react";
import { Inbox, Send, FileText, Plus, Trash2, Edit, Download, ExternalLink, X, CheckCircle } from "lucide-react";

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"Incoming" | "Outgoing">("Incoming");
  const [documents, setDocuments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [docId, setDocId] = useState<number | null>(null);
  const [type, setType] = useState<"Incoming" | "Outgoing">("Incoming");
  const [refNumber, setRefNumber] = useState("");
  const [title, setTitle] = useState("");
  const [docDate, setDocDate] = useState("");
  const [institution, setInstitution] = useState("");
  const [status, setStatus] = useState("Pending");
  const [notes, setNotes] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/documents/?type=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: type,
      reference_number: refNumber,
      title: title,
      document_date: docDate ? new Date(docDate).toISOString() : new Date().toISOString(),
      institution: institution,
      status: status,
      notes: notes,
      file_path: fileBase64
    };

    try {
      const url = docId ? `http://localhost:8000/api/v1/documents/${docId}` : `http://localhost:8000/api/v1/documents/`;
      const method = docId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchDocuments();
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setDocId(null);
    setRefNumber("");
    setTitle("");
    setDocDate("");
    setInstitution("");
    setStatus("Pending");
    setNotes("");
    setFileBase64(null);
  };

  const openNewModal = () => {
    resetForm();
    setType(activeTab);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: any) => {
    setDocId(doc.id);
    setType(doc.type);
    setRefNumber(doc.reference_number);
    setTitle(doc.title);
    // document_date format is ISO string, convert to YYYY-MM-DD for input[type="date"]
    setDocDate(doc.document_date ? new Date(doc.document_date).toISOString().split('T')[0] : "");
    setInstitution(doc.institution);
    setStatus(doc.status);
    setNotes(doc.notes || "");
    setFileBase64(doc.file_path);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ប្រព័ន្ធគ្រប់គ្រងលិខិតចេញចូល</h1>
          <p className="text-sm text-gray-500 mt-1">កត់ត្រា និងគ្រប់គ្រងឯកសាររដ្ឋបាល</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>បញ្ចូលលិខិតថ្មី</span>
        </button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("Incoming")}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "Incoming"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>លិខិតចូល (Incoming)</span>
        </button>
        <button
          onClick={() => setActiveTab("Outgoing")}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeTab === "Outgoing"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>លិខិតចេញ (Outgoing)</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">លេខលិខិត</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ចំណងជើងកម្មវត្ថុ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">កាលបរិច្ឆេទ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{activeTab === "Incoming" ? "ផ្ញើមកពី" : "បញ្ជូនទៅកាន់"}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ស្ថានភាព</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  មិនទាន់មានលិខិតនៅឡើយទេ
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {doc.reference_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-xs">{doc.title}</div>
                    {doc.notes && <div className="text-xs text-gray-500 truncate max-w-xs mt-1">{doc.notes}</div>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.document_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {doc.institution}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      doc.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      doc.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium flex justify-end space-x-3">
                    {doc.file_path && (
                      <a href={doc.file_path} target="_blank" className="text-indigo-600 hover:text-indigo-900" title="មើលឯកសារ (View)">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                    <button onClick={() => openEditModal(doc)} className="text-blue-600 hover:text-blue-900" title="កែប្រែ">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900" title="លុប">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                {activeTab === "Incoming" ? <Inbox className="w-5 h-5 mr-2 text-blue-600"/> : <Send className="w-5 h-5 mr-2 text-orange-600"/>}
                {docId ? "កែប្រែ" : "បញ្ចូល"} {activeTab === "Incoming" ? "លិខិតចូល" : "លិខិតចេញ"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ប្រភេទលិខិត</label>
                    <select 
                      className="w-full rounded-md border border-gray-300 p-2 text-sm bg-gray-50"
                      value={type}
                      disabled
                    >
                      <option value="Incoming">លិខិតចូល (Incoming)</option>
                      <option value="Outgoing">លិខិតចេញ (Outgoing)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">លេខលិខិត *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={refNumber}
                      onChange={e => setRefNumber(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">កម្មវត្ថុ / ចំណងជើង *</label>
                    <input 
                      type="text" 
                      required
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">កាលបរិច្ឆេទលិខិត *</label>
                    <input 
                      type="date" 
                      required
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={docDate}
                      onChange={e => setDocDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {activeTab === "Incoming" ? "ស្ថាប័នផ្ញើមក" : "ស្ថាប័នទទួល"} *
                    </label>
                    <input 
                      type="text" 
                      required
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ស្ថានភាព</label>
                    <select 
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="Pending">រង់ចាំចាត់ការ (Pending)</option>
                      <option value="Processing">កំពុងដោះស្រាយ (Processing)</option>
                      <option value="Completed">រួចរាល់ (Completed)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">កំណត់សម្គាល់ (Notes)</label>
                    <textarea 
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows={2}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ឯកសារ PDF (Scan រួច)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="space-y-1 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" accept="application/pdf,image/*" onChange={handleFileUpload} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                    {fileBase64 && (
                      <p className="mt-2 text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1"/> បានភ្ជាប់ឯកសារដោយជោគជ័យ។
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className={`px-6 py-2 text-sm font-medium text-white rounded-lg shadow-sm ${activeTab === 'Incoming' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
