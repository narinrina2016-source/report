"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, UploadCloud, CheckCircle, Info, FileText, Link as LinkIcon, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function PublicVisitRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    visitor_type: "គ្រឹះស្ថានអប់រំ",
    school_name: "",
    organization_address: "",
    purpose: "",
    visit_date: "",
    total_students: 0,
    female_students: 0,
    total_teachers: 0,
    female_teachers: 0,
    need_guide: false,
    guide_count: 0,
    contact_info: "",
    letter_number: "",
  });
  const [visitorTypes, setVisitorTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings/VISITOR_TYPES")
      .then(res => res.json())
      .then(data => {
        if (data.value && Array.isArray(data.value) && data.value.length > 0) {
          setVisitorTypes(data.value);
        } else {
          setVisitorTypes([
            "គ្រឹះស្ថានអប់រំ",
            "អង្គការនានា",
            "គណៈប្រតិភូ",
            "អង្គភាពសារព័ត៌មាន",
            "ក្រុមហ៊ុនផលិតវីដេអូ",
            "អ្នកផលិតមាតិកា",
            "សាសនិក",
            "ស្រាវជ្រាវ"
          ]);
        }
      })
      .catch(err => console.error("Error fetching visitor types:", err));
  }, []);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

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
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        file_path: fileBase64
      };
      
      const res = await fetch("http://localhost:8000/api/v1/visit-requests/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrackingToken(data.tracking_token);
        setIsSuccess(true);
      }
    } catch (e) {
      console.error(e);
      alert("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const trackingUrl = trackingToken ? `${window.location.origin}/track/${trackingToken}` : "";

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-4 shadow-xl rounded-2xl sm:px-10 text-center border-t-4 border-green-500">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ទទួលបានសំណើជោគជ័យ!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              សំណើសុំទស្សនកិច្ចរបស់លោកអ្នកត្រូវបានបញ្ចូលទៅក្នុងប្រព័ន្ធ។ លោកអ្នកអាចតាមដានស្ថានភាពសំណើរបស់លោកអ្នកតាមរយៈ QR Code ឬ Link ខាងក្រោម៖
            </p>
            
            {trackingToken && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100 flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-4 inline-block">
                  <QRCodeCanvas 
                    value={trackingUrl} 
                    size={160}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                
                <a 
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-100/50 px-4 py-2 rounded-lg transition-colors break-all"
                >
                  <LinkIcon className="h-4 w-4 mr-2 shrink-0" />
                  {trackingUrl}
                </a>
              </div>
            )}

            <button 
              onClick={() => { 
                setIsSuccess(false); 
                setTrackingToken(null);
                setFormData({visitor_type: "គ្រឹះស្ថានអប់រំ", school_name: "", organization_address: "", purpose: "", visit_date: "", total_students: 0, female_students: 0, total_teachers: 0, female_teachers: 0, need_guide: false, guide_count: 0, contact_info: "", letter_number: ""}); 
                setFileBase64(null); 
              }}
              className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              ដាក់សំណើថ្មីមួយទៀត
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <CalendarHeart className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          ទម្រង់ស្នើសុំទស្សនកិច្ចសិក្សាស្រាវជ្រាវ
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          មជ្ឈមណ្ឌលប្រល័យពូជសាសន៍
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ប្រភេទអ្នកមកទស្សនា *
              </label>
              <select
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                value={formData.visitor_type}
                onChange={e => setFormData({...formData, visitor_type: e.target.value})}
              >
                {visitorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ឈ្មោះសាលារៀន ឬ ស្ថាប័ន *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. វិទ្យាល័យព្រះស៊ីសុវត្ថិ"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.school_name}
                onChange={e => setFormData({...formData, school_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                អាសយដ្ឋានអង្គភាព *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. រាជធានីភ្នំពេញ"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.organization_address}
                onChange={e => setFormData({...formData, organization_address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                គោលបំណងនៃការទស្សនកិច្ច *
              </label>
              <textarea
                required
                rows={3}
                placeholder="ឧ. ដើម្បីឱ្យសិស្សានុសិស្សស្វែងយល់ពីប្រវត្តិសាស្រ្ត..."
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  កាលបរិច្ឆេទមកទស្សនកិច្ច *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.visit_date}
                  onChange={e => setFormData({...formData, visit_date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ព័ត៌មានទំនាក់ទំនង *
                </label>
                <input
                  type="text"
                  required
                  placeholder="លេខទូរស័ព្ទ / Email / Telegram Username"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.contact_info}
                  onChange={e => setFormData({...formData, contact_info: e.target.value})}
                />
              </div>
            </div>

            {formData.visitor_type === "គ្រឹះស្ថានអប់រំ" ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ចំនួនសិស្សសរុប *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.total_students}
                      onChange={e => setFormData({...formData, total_students: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ចំនួនសិស្សស្រី
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.female_students}
                      onChange={e => setFormData({...formData, female_students: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ចំនួនគ្រូសរុប
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.total_teachers}
                      onChange={e => setFormData({...formData, total_teachers: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ចំនួនគ្រូស្រី
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.female_teachers}
                      onChange={e => setFormData({...formData, female_teachers: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    អ្នកចូលរួមសរុប *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.total_students}
                    onChange={e => setFormData({...formData, total_students: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    អ្នកចូលរួមស្រី
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.female_students}
                    onChange={e => setFormData({...formData, female_students: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col bg-gray-50 p-4 rounded-lg border space-y-4">
              <div className="flex items-center">
                <input
                  id="need_guide"
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.need_guide}
                  onChange={e => setFormData({...formData, need_guide: e.target.checked})}
                />
                <label htmlFor="need_guide" className="ml-3 block text-sm font-medium text-gray-900">
                  តម្រូវការមគ្គុទ្ទេសក៍ផ្តល់ការពន្យល់ (Need a Tour Guide)
                </label>
              </div>
              
              {formData.need_guide && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ចំនួនមគ្គុទ្ទេសក៍ដែលត្រូវការ *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="appearance-none block w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.guide_count}
                    onChange={e => setFormData({...formData, guide_count: parseInt(e.target.value) || 0})}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                លិខិតស្នើសុំផ្លូវការ (បើមាន)
              </label>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="លេខលិខិតចូល / លេខលិខិតផ្លូវការ (បើមាន)"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.letter_number}
                  onChange={e => setFormData({...formData, letter_number: e.target.value})}
                />
              </div>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 px-2 py-1">
                      <span>ចុចទីនេះដើម្បី Upload ឯកសារ (PDF / រូបភាព)</span>
                      <input type="file" className="sr-only" accept="application/pdf,image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">ទំហំអតិបរមា 10MB</p>
                </div>
              </div>
              {fileBase64 && (
                <p className="mt-2 text-sm text-green-600 flex items-center bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4 mr-2"/> បានភ្ជាប់ឯកសារដោយជោគជ័យ។
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
              >
                {isSubmitting ? "កំពុងបញ្ជូន..." : "បញ្ជូនសំណើសុំ (Submit Request)"}
              </button>
            </div>
            
            <div className="flex items-start mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              <Info className="h-5 w-5 text-blue-500 mr-2 shrink-0" />
              <p>បន្ទាប់ពីចុច Submit សំណើនេះនឹងបញ្ជូនចូលទៅកាន់ក្រុមរដ្ឋបាលនៃមជ្ឈមណ្ឌល ដើម្បីពិនិត្យ និងឆ្លើយតបទៅកាន់លោកអ្នកវិញក្នុងពេលឆាប់ៗតាមរយៈព័ត៌មានទំនាក់ទំនងខាងលើ។</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
