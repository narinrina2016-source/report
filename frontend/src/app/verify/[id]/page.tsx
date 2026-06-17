"use client";
import { useState, useEffect, use } from "react";
import { CheckCircle, XCircle, ShieldCheck, FileText, Calendar, Hash, Users } from "lucide-react";
import { format } from "date-fns";

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/reports/${id}/verify`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          setError("ឯកសារមិនត្រឹមត្រូវ ឬត្រូវបានលុបបាត់ (Invalid or Unverified Document)");
        }
      } catch (e) {
        setError("មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ម៉ាស៊ីនមេ");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVerification();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">កំពុងផ្ទៀងផ្ទាត់ឯកសារ...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl text-center border-t-4 border-red-500">
          <XCircle className="h-20 w-20 text-red-500 mx-auto" />
          <h2 className="mt-6 text-2xl font-bold text-gray-900">បរាជ័យក្នុងការផ្ទៀងផ្ទាត់</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-8 bg-red-50 rounded-lg p-4 text-sm text-red-800">
            ឯកសារនេះអាចជារបស់ក្លែងក្លាយ ឬមិនទាន់ត្រូវបានអនុម័តជាផ្លូវការដោយស្ថាប័ន។
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Banner */}
          <div className="bg-green-600 px-6 py-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <ShieldCheck className="h-20 w-20 mx-auto relative z-10 text-green-100" />
            <h1 className="mt-4 text-3xl font-bold relative z-10">ឯកសារត្រឹមត្រូវ</h1>
            <p className="mt-2 text-green-100 font-medium relative z-10">
              Verified Authentic Document
            </p>
            <div className="mt-4 inline-flex items-center bg-green-700/50 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm border border-green-500/30">
              <CheckCircle className="w-4 h-4 mr-2" />
              បញ្ជាក់ដោយប្រព័ន្ធ ARMS
            </div>
          </div>

          {/* Document Info */}
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" /> 
              ព័ត៌មានទូទៅនៃឯកសារ
            </h2>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Hash className="w-4 h-4 mr-1" /> លេខលិខិត (Ref No.)
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">{data.reference_number}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> កាលបរិច្ឆេទចេញ (Date)
                </dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {data.finalized_date ? format(new Date(data.finalized_date), 'dd MMMM yyyy, HH:mm') : 'មិនមាន'}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">ចំណងជើងរបាយការណ៍ (Title)</dt>
                <dd className="mt-1 text-lg font-bold text-blue-900 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  {data.title}
                </dd>
              </div>
            </dl>

            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6 border-b pb-2 flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-400" /> 
              បញ្ជីឈ្មោះអ្នកពាក់ព័ន្ធ (Signatories & Reviewers)
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">អ្នកបង្កើត (Creator)</span>
                  <span className="font-semibold text-gray-900">{data.creator || "មិនបញ្ជាក់"}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">អ្នកកែសម្រួល (Editor - Checked)</span>
                  <span className="font-semibold text-gray-900">{data.editor || "មិនបញ្ជាក់"}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">ប្រធាននាយកដ្ឋាន (Dept Head - Seen & Agreed)</span>
                  <span className="font-semibold text-gray-900">{data.department_head || "មិនបញ្ជាក់"}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">រដ្ឋបាល (Admin - Verified)</span>
                  <span className="font-semibold text-gray-900">{data.admin || "មិនបញ្ជាក់"}</span>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200 mt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-green-800">ប្រធានស្ថាប័ន (President - Approved)</span>
                  <span className="text-lg font-bold text-green-900">{data.president || "មិនបញ្ជាក់"}</span>
                </div>
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="mt-10 bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                ឯកសារនេះត្រូវបានទាញយក និងផ្ទៀងផ្ទាត់ដោយប្រព័ន្ធ Automated Report Management System (ARMS)។
                រាល់ការប៉ុនប៉ងក្លែងបន្លំ ឬកែប្រែទិន្នន័យលើលិខិតស្នាមដែលបោះពុម្ពចេញពីប្រព័ន្ធ គឺជាអំពើខុសច្បាប់។
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
