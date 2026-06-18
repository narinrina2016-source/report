"use client";
import { FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const OverviewChart = dynamic(() => import("@/components/dashboard/OverviewChart").then(mod => mod.OverviewChart), { ssr: false });

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ទំព័រដើម</h2>
        <div className="flex items-center space-x-2">
          {/* Calendar or Date Picker placeholder */}
          <span className="text-sm text-gray-500">មិថុនា ២០២៦</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reports */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">របាយការណ៍សរុប</h3>
            <FileText className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold">1,248</div>
          <p className="text-xs text-gray-500">+12% កើនឡើងធៀបខែមុន</p>
        </div>

        {/* Pending Approval */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">រង់ចាំការអនុម័ត</h3>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-gray-500">ទាមទារការពិនិត្យពីអ្នកគ្រប់គ្រង</p>
        </div>

        {/* Approved Reports */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">បានអនុម័ត</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">892</div>
          <p className="text-xs text-gray-500">សរុបក្នុងឆ្នាំនេះ</p>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">ព័ត៌មានវិភាគដោយ AI</h3>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">+8.3%</div>
          <p className="text-xs text-gray-500">ចំនួនភ្ញៀវទេសចរកើនឡើង</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white shadow-sm min-h-[400px]">
           <OverviewChart />
        </div>
        <div className="col-span-3 rounded-xl border bg-white shadow-sm p-6 flex flex-col">
           <h3 className="text-lg font-medium mb-4">សកម្មភាពថ្មីៗ (Recent Activity)</h3>
           <div className="space-y-4 flex-1">
             <div className="flex space-x-3 text-sm">
               <span className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
               <div>
                 <p><span className="font-medium">John Doe</span> បានបង្កើត <span className="font-medium text-blue-600">របាយការណ៍ហិរញ្ញវត្ថុត្រីមាសទី២</span></p>
                 <p className="text-gray-500 text-xs">២ ម៉ោងមុន</p>
               </div>
             </div>
             <div className="flex space-x-3 text-sm">
               <span className="h-2 w-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
               <div>
                 <p><span className="font-medium">Admin</span> បានអនុម័ត <span className="font-medium text-blue-600">ស្ថិតិភ្ញៀវទេសចរខែឧសភា</span></p>
                 <p className="text-gray-500 text-xs">៥ ម៉ោងមុន</p>
               </div>
             </div>
             <div className="flex space-x-3 text-sm">
               <span className="h-2 w-2 mt-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
               <div>
                 <p><span className="font-medium">System (AI)</span> បានបង្កើត <span className="font-medium text-blue-600">របាយការណ៍សង្ខេប</span></p>
                 <p className="text-gray-500 text-xs">១ ថ្ងៃមុន</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
