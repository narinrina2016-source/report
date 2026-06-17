"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, Download, ExternalLink, X, Wand2, Pencil, Maximize2, Send, Clock, Circle } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Assign Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState<"Editor" | "Department Head" | "Admin" | "President">("Editor");
  const [assignReportId, setAssignReportId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  // Finalize Modal State
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [finalizeRefNumber, setFinalizeRefNumber] = useState("");
  const [finalizeIncludeQr, setFinalizeIncludeQr] = useState(true);
  const [finalizeReportId, setFinalizeReportId] = useState<number | null>(null);
  
  // Tracking Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [trackingReportId, setTrackingReportId] = useState<number | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  
  // Dispatch Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchReportId, setDispatchReportId] = useState<number | null>(null);
  const [dispatchInstitution, setDispatchInstitution] = useState("");
  const [dispatchMethod, setDispatchMethod] = useState("");
  const [dispatchPhoto, setDispatchPhoto] = useState<string | null>(null);
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  
  // Dispatch History Modal State
  const [isDispatchHistoryModalOpen, setIsDispatchHistoryModalOpen] = useState(false);
  const [dispatchHistoryReportId, setDispatchHistoryReportId] = useState<number | null>(null);
  const [dispatchHistoryData, setDispatchHistoryData] = useState<any[]>([]);
  const [receivePhoto, setReceivePhoto] = useState<string | null>(null);
  const [receivingDispatchId, setReceivingDispatchId] = useState<number | null>(null);
  
  // Modal State
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancingFields, setEnhancingFields] = useState<{[key: string]: boolean}>({});
  const [editingReportId, setEditingReportId] = useState<number | null>(null);

  const handleEditClick = (report: any) => {
    setEditingReportId(report.id);
    setReportTitle(report.title);
    setSelectedTemplateId(report.template_id?.toString() || "");
    setFormData(report.data || {});
    setIsModalOpen(true);
  };

  const handleAIEnhance = async (fieldName: string, text: string) => {
    if (!text || text.trim() === "") return;
    setEnhancingFields(prev => ({ ...prev, [fieldName]: true }));
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhanced_text) {
          setFormData((prev: any) => ({ ...prev, [fieldName]: data.enhanced_text }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnhancingFields(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleTrackingClick = async (reportId: number) => {
    setTrackingReportId(reportId);
    setIsLoadingTracking(true);
    setIsTrackingModalOpen(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${reportId}/tracking`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTracking(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setPhotoState: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoState(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDispatch = async () => {
    if (!dispatchReportId || !dispatchInstitution || !dispatchMethod) return;
    setIsSubmittingDispatch(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${dispatchReportId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution_name: dispatchInstitution,
          dispatch_method: dispatchMethod,
          dispatch_photo: dispatchPhoto
        })
      });
      if (res.ok) {
        setIsDispatchModalOpen(false);
        setDispatchInstitution("");
        setDispatchMethod("");
        setDispatchPhoto(null);
        alert("ការរត់ឯកសារត្រូវបានកត់ត្រាដោយជោគជ័យ!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingDispatch(true);
    }
  };

  const handleDispatchHistoryClick = async (reportId: number) => {
    setDispatchHistoryReportId(reportId);
    setIsDispatchHistoryModalOpen(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${reportId}/dispatches`);
      if (res.ok) {
        const data = await res.json();
        setDispatchHistoryData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReceiveDispatch = async (dispatchId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/dispatches/${dispatchId}/receive`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receive_photo: receivePhoto
        })
      });
      if (res.ok) {
        setReceivePhoto(null);
        setReceivingDispatchId(null);
        if (dispatchHistoryReportId) handleDispatchHistoryClick(dispatchHistoryReportId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/reports/");
      if (res.ok) setReports(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/templates/");
      if (res.ok) setTemplates(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/");
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchReports();
    fetchTemplates();
    fetchUsers();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/reports/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", comments: "Approved by manager" })
      });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const handleReject = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/reports/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Returned for Revision", comments: "Needs work" })
      });
      fetchReports();
    } catch (e) { console.error(e); }
  };

  const handleAssign = async () => {
    if (!assignReportId || !selectedUserId) return;
    const endpoint = assignRole === "Editor" ? "assign_editor" : 
                     assignRole === "Department Head" ? "assign_department_head" :
                     assignRole === "Admin" ? "assign_admin" : "assign_president";
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${assignReportId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(selectedUserId) })
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinalize = async () => {
    if (!finalizeReportId || !finalizeRefNumber) {
      alert("សូមបញ្ចូលលេខលិខិត");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/reports/${finalizeReportId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_number: finalizeRefNumber, include_qr: finalizeIncludeQr })
      });
      if (res.ok) {
        setIsFinalizeModalOpen(false);
        fetchReports();
      } else {
        alert("បរាជ័យក្នុងការចេញលេខលិខិត");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!reportTitle || !selectedTemplateId) {
      alert("Please enter title and select a template");
      return;
    }
    setIsGenerating(true);
    try {
      const payload = {
        title: reportTitle,
        template_id: parseInt(selectedTemplateId),
        data: formData
      };
      
      const url = editingReportId 
        ? `http://localhost:8000/api/v1/reports/${editingReportId}`
        : "http://localhost:8000/api/v1/reports/";
        
      const res = await fetch(url, {
        method: editingReportId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setReportTitle("");
        setSelectedTemplateId("");
        setFormData({});
        setEditingReportId(null);
        fetchReports();
      } else {
        const errData = await res.json();
        alert(`Failed to generate report: ${errData.detail || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error generating report");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === parseInt(selectedTemplateId));
  const dynamicFields = selectedTemplate?.fields ? Object.entries(selectedTemplate.fields) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">របាយការណ៍ (Reports & Workflow)</h2>
        <button 
          onClick={() => {
            setEditingReportId(null);
            setReportTitle("");
            setSelectedTemplateId("");
            setFormData({});
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <FileText className="h-4 w-4" />
          <span>បង្កើតរបាយការណ៍ថ្មី</span>
        </button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ចំណងជើងរបាយការណ៍</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">គំរូឯកសារ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ស្ថានភាព</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">សកម្មភាព</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">រកមិនឃើញរបាយការណ៍ទេ។</td></tr>
            )}
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Template ID: {report.template_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${report.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                      report.status === 'Manager Review' ? 'bg-orange-100 text-orange-800' : 
                      report.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                  {report.generated_file_path ? (
                    <a 
                      href={`http://localhost:8000/api/v1/reports/${report.id}/download`} 
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-900" 
                      title="មើលឯកសារ (View Document)"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  ) : (
                    <span className="text-gray-300" title="No document available">
                      <ExternalLink className="h-5 w-5" />
                    </span>
                  )}
                  {report.status === "Draft" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="Full Editor (A4)">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleEditClick(report)} className="text-gray-500 hover:text-gray-900" title="Edit Fields">
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setAssignReportId(report.id); setAssignRole("Editor"); setIsAssignModalOpen(true); }} className="text-blue-600 hover:text-blue-900" title="Send to Editor">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Sent to Editor" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="Full Editor (A4)">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => {
                        fetch(`http://localhost:8000/api/v1/reports/${report.id}/approve`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "Editor Reviewed", comments: "Reviewed by Editor" })
                        }).then(() => fetchReports());
                      }} className="text-blue-600 hover:text-blue-900" title="Return to Creator">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Editor Reviewed" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="View Editor's Changes">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setAssignReportId(report.id); setAssignRole("Department Head"); setIsAssignModalOpen(true); }} className="text-blue-600 hover:text-blue-900" title="Send to Department Head">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Sent to Department Head" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="Full Editor (A4)">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => {
                        fetch(`http://localhost:8000/api/v1/reports/${report.id}/approve`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "Department Head Reviewed", comments: "Reviewed by Dept Head" })
                        }).then(() => fetchReports());
                      }} className="text-blue-600 hover:text-blue-900" title="Return to Creator">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Department Head Reviewed" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="View Dept Head's Changes">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setAssignReportId(report.id); setAssignRole("Admin"); setIsAssignModalOpen(true); }} className="text-blue-600 hover:text-blue-900" title="Send to Admin">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Sent to Admin" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="Full Editor (A4)">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => {
                        fetch(`http://localhost:8000/api/v1/reports/${report.id}/approve`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "Admin Reviewed", comments: "Reviewed by Admin" })
                        }).then(() => fetchReports());
                      }} className="text-blue-600 hover:text-blue-900" title="Return to Creator">
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setAssignReportId(report.id); setAssignRole("President"); setIsAssignModalOpen(true); }} className="text-green-600 hover:text-green-900" title="Send to President">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Admin Reviewed" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="View Admin's Changes">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900" title="Track Document">
                        <Clock className="h-5 w-5" />
                      </button>
                      <button onClick={() => { setAssignReportId(report.id); setAssignRole("President"); setIsAssignModalOpen(true); }} className="text-blue-600 hover:text-blue-900" title="Send to President">
                        <Send className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Sent to President" && (
                    <>
                      <a href={`/reports/${report.id}/edit`} className="text-purple-600 hover:text-purple-900" title="View & Comment">
                        <Maximize2 className="h-5 w-5" />
                      </a>
                      <button onClick={() => handleApprove(report.id)} className="text-green-600 hover:text-green-900" title="Final Approve">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleReject(report.id)} className="text-red-600 hover:text-red-900" title="Return for Revision">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {report.status === "Approved" && (
                      <>
                        <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900 mr-2" title="Track Document">
                          <Clock className="h-5 w-5" />
                        </button>
                        <button onClick={() => { setFinalizeReportId(report.id); setIsFinalizeModalOpen(true); }} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded border border-green-200 text-sm flex items-center shadow-sm" title="Finalize Document">
                          <CheckCircle className="h-5 w-5 mr-1" /> Finalize
                        </button>
                      </>
                  )}
                  {report.status === "Finalized" && (
                      <>
                        <button onClick={() => handleTrackingClick(report.id)} className="text-gray-500 hover:text-gray-900 mr-2" title="Track Document">
                          <Clock className="h-5 w-5" />
                        </button>
                        <a href={`http://localhost:8000/api/v1/reports/${report.id}/download`} target="_blank" className="text-indigo-600 hover:text-indigo-900 mr-2" title="មើលឯកសារ (View Document)">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                        <button onClick={() => { setDispatchReportId(report.id); setIsDispatchModalOpen(true); }} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded border border-orange-200 text-sm flex items-center shadow-sm mr-2" title="Dispatch Document">
                          <Send className="h-4 w-4 mr-1" /> រត់ឯកសារ
                        </button>
                        <button onClick={() => handleDispatchHistoryClick(report.id)} className="text-purple-600 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded border border-purple-200 text-sm flex items-center shadow-sm" title="Dispatch History">
                          ប្រវត្តិបញ្ជូនចេញ
                        </button>
                      </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">
                {editingReportId ? "កែប្រែរបាយការណ៍" : "បង្កើតរបាយការណ៍ថ្មី"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700">ចំណងជើងរបាយការណ៍</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={reportTitle}
                  onChange={e => setReportTitle(e.target.value)}
                  placeholder="e.g. June Monthly Report"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ជ្រើសរើសគំរូឯកសារ</label>
                <select 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                  value={selectedTemplateId}
                  onChange={e => {
                    setSelectedTemplateId(e.target.value);
                    setFormData({});
                  }}
                >
                  <option value="">-- ជ្រើសរើសគំរូឯកសារ --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              {dynamicFields.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">វាលទិន្នន័យ (Template Fields)</h4>
                  <div className="space-y-3">
                    {dynamicFields.map(([fieldName, fieldType]) => (
                      <div key={fieldName}>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-medium text-gray-700">{fieldName}</label>
                          {fieldType === "text" && (
                            <button 
                              onClick={() => handleAIEnhance(fieldName, formData[fieldName])}
                              disabled={!formData[fieldName] || enhancingFields[fieldName]}
                              title="ឲ្យ AI ជួយកែសម្រួលអត្ថបទ"
                              className="text-xs flex items-center space-x-1 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                            >
                              <Wand2 className="h-3 w-3" />
                              <span>{enhancingFields[fieldName] ? "កំពុងកែសម្រួល..." : "AI ជួយសរសេរ"}</span>
                            </button>
                          )}
                        </div>
                        {fieldType === "text" && (formData[fieldName] || "").length > 50 ? (
                          <textarea 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                            rows={3}
                            value={formData[fieldName] || ""}
                            onChange={e => setFormData({ ...formData, [fieldName]: e.target.value })}
                          />
                        ) : (
                          <input 
                            type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                            value={formData[fieldName] || ""}
                            onChange={e => setFormData({ ...formData, [fieldName]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                បោះបង់ (Cancel)
              </button>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !selectedTemplateId || !reportTitle}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isGenerating ? "កំពុងដំណើរការ..." : (editingReportId ? "រក្សាទុកការកែប្រែ" : "បង្កើតឯកសារ")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              បញ្ជូនរបាយការណ៍ទៅ {assignRole}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ជ្រើសរើសបុគ្គលិក</label>
                <select 
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- សូមជ្រើសរើស --</option>
                  {users.filter(u => u.role === assignRole).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
                {users.filter(u => u.role === assignRole).length === 0 && (
                  <p className="text-xs text-red-500 mt-2">មិនទាន់មាន {assignRole} ក្នុងប្រព័ន្ធទេ។ សូមចូលទៅកាន់បញ្ជីបុគ្គលិក ដើម្បីបង្កើត!</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAssignModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                បោះបង់
              </button>
              <button 
                onClick={handleAssign} 
                disabled={!selectedUserId}
                className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                <Send className="h-4 w-4" />
                <span>បញ្ជូន</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Modal */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              បញ្ចេញលេខលិខិត (Finalize)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">លេខលិខិត</label>
                <input 
                  type="text"
                  placeholder="ឧទាហរណ៍: ១២៣/២០២៦ រដ្ឋបាល"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={finalizeRefNumber}
                  onChange={(e) => setFinalizeRefNumber(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="include_qr"
                  checked={finalizeIncludeQr}
                  onChange={(e) => setFinalizeIncludeQr(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="include_qr" className="text-sm font-medium text-gray-700">
                  ភ្ជាប់ QR Code ការពារការក្លែងបន្លំទៅក្នុងឯកសារ PDF
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsFinalizeModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                បោះបង់
              </button>
              <button 
                onClick={handleFinalize} 
                className="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>បញ្ចេញជាផ្លូវការ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" /> ប្រវត្តិលំហូរការងារ (Tracking History)
              </h3>
              <button onClick={() => setIsTrackingModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingTracking ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="relative border-l-2 border-blue-200 ml-4 space-y-8">
                  {trackingData.map((item, index) => {
                    const isLast = index === trackingData.length - 1;
                    const isFinalized = item.status === "Finalized";
                    const isApproved = item.status === "Approved";
                    return (
                      <div key={index} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 bg-white ${isFinalized ? 'border-green-500 bg-green-100' : isApproved ? 'border-indigo-500 bg-indigo-100' : 'border-blue-500'}`}>
                          {(isFinalized || isApproved) && <div className={`h-2 w-2 m-[2px] rounded-full ${isFinalized ? 'bg-green-500' : 'bg-indigo-500'}`}></div>}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isFinalized ? 'text-green-700' : isApproved ? 'text-indigo-700' : 'text-gray-900'}`}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleString()} • <span className="font-medium text-gray-700">{item.user}</span>
                          </span>
                          {item.comments && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                              "{item.comments}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
              <button 
                onClick={() => setIsTrackingModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Send className="w-5 h-5 mr-2 text-orange-600" /> រត់ឯកសារ (Dispatch)
              </h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ស្ថាប័នទទួល (Institution)
                </label>
                <input 
                  type="text" 
                  placeholder="ឧទាហរណ៍៖ ក្រសួងមហាផ្ទៃ"
                  className="w-full border-gray-300 rounded-md p-2 border"
                  value={dispatchInstitution}
                  onChange={e => setDispatchInstitution(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  មធ្យោបាយបញ្ជូន (Method)
                </label>
                <input 
                  type="text" 
                  placeholder="ឧទាហរណ៍៖ តេឡេក្រាម / ប្រៃសណីយ៍"
                  className="w-full border-gray-300 rounded-md p-2 border"
                  value={dispatchMethod}
                  onChange={e => setDispatchMethod(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  រូបថតពេលចេញ (Dispatch Photo - ជម្រើស)
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={e => handlePhotoUpload(e, setDispatchPhoto)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {dispatchPhoto && (
                  <img src={dispatchPhoto} alt="Dispatch preview" className="mt-2 h-32 w-auto object-cover rounded shadow" />
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                បោះបង់
              </button>
              <button 
                onClick={handleDispatch}
                disabled={!dispatchInstitution || !dispatchMethod || isSubmittingDispatch}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-orange-400"
              >
                {isSubmittingDispatch ? "កំពុងបញ្ជូន..." : "បញ្ជូនឯកសារ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch History Modal */}
      {isDispatchHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Send className="w-5 h-5 mr-2 text-purple-600" /> ប្រវត្តិបញ្ជូនឯកសារ (Dispatch History)
              </h3>
              <button onClick={() => setIsDispatchHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {dispatchHistoryData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">មិនទាន់មានការបញ្ជូនចេញសម្រាប់លិខិតនេះទេ</p>
              ) : (
                dispatchHistoryData.map((disp, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${disp.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {disp.status}
                        </span>
                        <h4 className="font-bold text-gray-900">{disp.institution_name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">មធ្យោបាយ: <span className="font-medium">{disp.dispatch_method}</span></p>
                      <p className="text-sm text-gray-600">បញ្ជូនចេញ: {new Date(disp.sent_at).toLocaleString()}</p>
                      {disp.dispatch_photo && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">រូបថតពេលចេញ:</p>
                          <img src={disp.dispatch_photo} alt="Dispatch" className="h-24 w-auto object-cover rounded border" />
                        </div>
                      )}
                      
                      {disp.status === "Received" && (
                        <>
                          <div className="border-t pt-2 mt-2">
                            <p className="text-sm text-gray-600">ពេលគេទទួល: <span className="text-green-700 font-medium">{new Date(disp.received_at).toLocaleString()}</span></p>
                            {disp.receive_photo && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">រូបថតអ្នកទទួល:</p>
                                <img src={disp.receive_photo} alt="Received" className="h-24 w-auto object-cover rounded border" />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {disp.status === "Sent" && (
                      <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col items-center justify-center space-y-3 min-w-[200px]">
                        {receivingDispatchId === disp.id ? (
                          <div className="w-full space-y-2">
                            <label className="block text-xs font-medium text-gray-700">រូបថតអ្នកទទួល (ជម្រើស)</label>
                            <input 
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={e => handlePhotoUpload(e, setReceivePhoto)}
                              className="w-full text-xs text-gray-500 file:py-1 file:px-2 file:rounded file:border-0 file:bg-green-50 file:text-green-700"
                            />
                            {receivePhoto && <img src={receivePhoto} alt="preview" className="h-16 object-cover rounded" />}
                            <div className="flex space-x-2 w-full mt-2">
                              <button onClick={() => setReceivingDispatchId(null)} className="flex-1 py-1 text-xs border rounded bg-white text-gray-600">បោះបង់</button>
                              <button onClick={() => handleReceiveDispatch(disp.id)} className="flex-1 py-1 text-xs border border-transparent rounded bg-green-600 text-white">បញ្ជាក់</button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReceivingDispatchId(disp.id)}
                            className="w-full px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 flex items-center justify-center font-medium text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> គេបានទទួល
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
              <button 
                onClick={() => setIsDispatchHistoryModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
