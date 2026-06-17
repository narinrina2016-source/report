"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, CheckCircle, XCircle, FileText, ExternalLink, Download, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function VisitRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState("");
  
  const [isDecideModalOpen, setIsDecideModalOpen] = useState(false);
  const [decision, setDecision] = useState<"Approved" | "Rejected">("Approved");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchUsers();
    }
  }, [token]);

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/visit-requests/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async () => {
    if (!selectedReqId || !assigneeId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/visit-requests/${selectedReqId}/assign?assigned_to=${assigneeId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecide = async () => {
    if (!selectedReqId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/visit-requests/${selectedReqId}/decide?status=${decision}&comments=${encodeURIComponent(comments)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsDecideModalOpen(false);
        setComments("");
        fetchRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAssignModal = (id: number) => {
    setSelectedReqId(id);
    setAssigneeId("");
    setIsAssignModalOpen(true);
  };

  const openDecideModal = (id: number, decisionType: "Approved" | "Rejected") => {
    setSelectedReqId(id);
    setDecision(decisionType);
    setComments("");
    setIsDecideModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarHeart className="h-6 w-6 mr-2 text-blue-600" /> គ្រប់គ្រងសំណើសុំទស្សនកិច្ច
          </h1>
          <p className="text-sm text-gray-500 mt-1">រាល់សំណើដែលបានដាក់ពីសាធារណជន</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/visit-request"
            target="_blank"
            className="flex items-center space-x-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>បើកទំព័រ Public Form</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            មិនទាន់មានសំណើទស្សនកិច្ចនៅឡើយទេ
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
              <div className={`px-4 py-3 border-b flex justify-between items-center ${
                req.status === 'Pending' ? 'bg-yellow-50' :
                req.status === 'Assigned' ? 'bg-blue-50' :
                req.status === 'Approved' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  req.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                  req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {req.status === 'Pending' ? 'រង់ចាំការចាត់ចែង' :
                   req.status === 'Assigned' ? 'កំពុងពិនិត្យ' :
                   req.status === 'Approved' ? 'បានអនុម័ត' : 'បដិសេធ'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                <div>
                  <div className="mb-1">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border">{req.visitor_type || "គ្រឹះស្ថានអប់រំ"}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{req.school_name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{req.purpose}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg border">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">កាលបរិច្ឆេទ</span>
                    <span className="font-medium text-gray-900">{new Date(req.visit_date).toLocaleDateString()}</span>
                  </div>
                  {req.visitor_type === "គ្រឹះស្ថានអប់រំ" ? (
                    <>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">សិស្សសរុប (ស្រី)</span>
                        <span className="font-medium text-gray-900">{req.total_students} នាក់ ({req.female_students})</span>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500 mb-1">គ្រូសរុប (ស្រី)</span>
                        <span className="font-medium text-gray-900">{req.total_teachers || 0} នាក់ ({req.female_teachers || 0})</span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-1">
                      <span className="block text-xs text-gray-500 mb-1">អ្នកចូលរួមសរុប (ស្រី)</span>
                      <span className="font-medium text-gray-900">{req.total_students} នាក់ ({req.female_students})</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">លេខលិខិតចូល</span>
                    <span className="font-medium text-gray-900">{req.letter_number || "មិនមាន"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">អាសយដ្ឋានអង្គភាព</span>
                    <span className="font-medium text-gray-900 break-words">{req.organization_address || "មិនមាន"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-gray-500 mb-1">ទំនាក់ទំនង</span>
                    <span className="font-medium text-gray-900 break-all">{req.contact_info}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${req.need_guide ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {req.need_guide ? `ត្រូវការមគ្គុទ្ទេសក៍ (${req.guide_count || 0} នាក់)` : "មិនត្រូវការមគ្គុទ្ទេសក៍"}
                    </span>
                  </div>
                  {req.file_path && (
                    <a href={req.file_path} target="_blank" className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md" title="មើលឯកសារភ្ជាប់ (View)">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {req.comments && (
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 border-l-4 border-gray-300 italic">
                    "{req.comments}"
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 flex gap-2">
                {req.status === 'Pending' && (
                  <button 
                    onClick={() => openAssignModal(req.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors"
                  >
                    បញ្ជូនបន្ត (Assign)
                  </button>
                )}
                {req.status === 'Assigned' && (
                  <>
                    <button 
                      onClick={() => openDecideModal(req.id, "Approved")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded flex justify-center items-center transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> អនុម័ត
                    </button>
                    <button 
                      onClick={() => openDecideModal(req.id, "Rejected")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded flex justify-center items-center transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> បដិសេធ
                    </button>
                  </>
                )}
                {(req.status === 'Approved' || req.status === 'Rejected') && (
                  <div className="flex-1 text-center text-sm font-medium text-gray-500 py-2">
                    បានបញ្ចប់ការពិនិត្យ
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold text-lg">បញ្ជូនសំណើបន្ត</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ជ្រើសរើសប្រធានផ្នែកទទួលបន្ទុក</label>
                <select 
                  className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                >
                  <option value="">-- សូមជ្រើសរើស --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">បោះបង់</button>
              <button onClick={handleAssign} disabled={!assigneeId} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">បញ្ជូន</button>
            </div>
          </div>
        </div>
      )}

      {/* Decide Modal */}
      {isDecideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className={`p-4 border-b ${decision === 'Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-bold text-lg flex items-center ${decision === 'Approved' ? 'text-green-800' : 'text-red-800'}`}>
                {decision === 'Approved' ? <CheckCircle className="mr-2 w-5 h-5"/> : <XCircle className="mr-2 w-5 h-5"/>}
                {decision === 'Approved' ? 'អនុម័តសំណើ' : 'បដិសេធសំណើ'}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 p-3 rounded flex items-start text-sm text-blue-800">
                <MessageSquare className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>ប្រព័ន្ធនឹងបាញ់សារចូល Telegram រដ្ឋបាល ដើម្បីជូនដំណឹងពីការសម្រេចនេះ។ ប្រសិនបើស្ថាប័នស្នើសុំបានផ្តល់ Telegram ID, វានឹងផ្ញើសារទៅកាន់ពួកគាត់ផងដែរ។</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">មតិយោបល់ / សារឆ្លើយតប</label>
                <textarea 
                  className="w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="ឧ. យល់ព្រមតាមសំណើ។ សូមមកដល់មុនម៉ោង 15 នាទី។"
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
              <button onClick={() => setIsDecideModalOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">បោះបង់</button>
              <button 
                onClick={handleDecide} 
                className={`px-4 py-2 text-white rounded text-sm ${decision === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                បញ្ជាក់ការសម្រេច
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
