"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const data = [
  { name: "Jan", Approved: 120, Rejected: 10, Pending: 20 },
  { name: "Feb", Approved: 150, Rejected: 15, Pending: 10 },
  { name: "Mar", Approved: 180, Rejected: 5, Pending: 25 },
  { name: "Apr", Approved: 210, Rejected: 8, Pending: 15 },
  { name: "May", Approved: 250, Rejected: 12, Pending: 30 },
  { name: "Jun", Approved: 190, Rejected: 4, Pending: 40 },
];

export function OverviewChart() {
  return (
    <div className="h-full w-full p-4">
      <h3 className="mb-4 text-lg font-medium">Monthly Reports Statistics</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Legend />
            <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
