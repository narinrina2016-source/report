"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, XCircle, Search, Info } from "lucide-react";

type VisitRequest = {
  id: number;
  visitor_type: string;
  school_name: string;
  organization_address?: string;
  purpose: string;
  visit_date: string;
  total_students: number;
  female_students: number;
  total_teachers?: number;
  female_teachers?: number;
  need_guide: boolean;
  guide_count?: number;
  contact_info: string;
  letter_number?: string;
  status: string;
  created_at: string;
};

export default function TrackRequestPage() {
  const params = useParams();
  const token = params?.token;
  const [request, setRequest] = useState<VisitRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:8000/api/v1/visit-requests/track/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("មិនរកឃើញសំណើរបស់អ្នកទេ។ សូមពិនិត្យមើល Link ឬ QR Code ឡើងវិញ។");
        }
        return res.json();
      })
      .then((data) => {
        setRequest(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">កំពុងស្វែងរកទិន្នន័យ...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">មានបញ្ហា</h2>
          <p className="text-gray-600">{error || "មានបញ្ហាក្នុងការទាញយកទិន្នន័យ។"}</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "Pending":
      case "Assigned":
        return {
          icon: <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />,
          title: "កំពុងរង់ចាំការពិនិត្យ",
          color: "border-yellow-500",
          textColor: "text-yellow-700",
          bg: "bg-yellow-50",
          desc: "សំណើរបស់អ្នកកំពុងស្ថិតក្នុងការពិនិត្យដោយមន្ត្រីរដ្ឋបាល។"
        };
      case "Approved":
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />,
          title: "សំណើត្រូវបានអនុម័ត",
          color: "border-green-500",
          textColor: "text-green-700",
          bg: "bg-green-50",
          desc: "សំណើសុំទស្សនកិច្ចរបស់អ្នកត្រូវបានអនុម័តដោយជោគជ័យ។ ក្រុមការងារនឹងទាក់ទងទៅអ្នកក្នុងពេលឆាប់ៗនេះ។"
        };
      case "Rejected":
        return {
          icon: <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />,
          title: "សំណើត្រូវបានបដិសេធ",
          color: "border-red-500",
          textColor: "text-red-700",
          bg: "bg-red-50",
          desc: "សូមអភ័យទោស សំណើសុំទស្សនកិច្ចរបស់អ្នកត្រូវបានបដិសេធដោយសារមូលហេតុមួយចំនួន។"
        };
      default:
        return {
          icon: <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />,
          title: "ស្ថានភាពមិនច្បាស់លាស់",
          color: "border-gray-500",
          textColor: "text-gray-700",
          bg: "bg-gray-50",
          desc: "មិនមានព័ត៌មានអំពីស្ថានភាពនេះទេ។"
        };
    }
  };

  const statusDisplay = getStatusDisplay(request.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className={`bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 ${statusDisplay.color}`}>
          
          <div className={`px-6 py-8 text-center ${statusDisplay.bg}`}>
            {statusDisplay.icon}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusDisplay.title}</h2>
            <p className={`${statusDisplay.textColor} text-sm max-w-md mx-auto`}>
              {statusDisplay.desc}
            </p>
          </div>

          <div className="px-6 py-6 sm:p-8">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-500" /> ព័ត៌មានសង្ខេបនៃសំណើ
            </h3>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">សាលា/ស្ថាប័ន</dt>
                <dd className="mt-1 text-sm text-gray-900 font-semibold">{request.school_name}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">ប្រភេទ</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.visitor_type}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">កាលបរិច្ឆេទស្នើសុំមកទស្សនា</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(request.visit_date).toLocaleString()}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">កាលបរិច្ឆេទផ្ញើសំណើ</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(request.created_at).toLocaleString()}</dd>
              </div>

              {request.letter_number && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">លេខលិខិតចូល</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.letter_number}</dd>
                </div>
              )}

              <div className="sm:col-span-2 bg-gray-50 p-4 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  {request.visitor_type === "គ្រឹះស្ថានអប់រំ" ? (
                    <>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">សិស្សសរុប (ស្រី)</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium">{request.total_students} នាក់ ({request.female_students})</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500">គ្រូសរុប (ស្រី)</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium">{request.total_teachers || 0} នាក់ ({request.female_teachers || 0})</dd>
                      </div>
                    </>
                  ) : (
                    <div>
                      <dt className="text-xs font-medium text-gray-500">អ្នកចូលរួមសរុប (ស្រី)</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-medium">{request.total_students} នាក់ ({request.female_students})</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-medium text-gray-500">តម្រូវការមគ្គុទ្ទេសក៍</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {request.need_guide ? `ត្រូវការ (${request.guide_count} នាក់)` : "មិនត្រូវការ"}
                    </dd>
                  </div>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
