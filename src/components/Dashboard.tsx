import React, { useMemo } from "react";
import { 
  Users, CheckCircle, Clock, AlertCircle, AlertTriangle, 
  Bell
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { parseISO, differenceInDays } from "date-fns";
import { cn, formatThaiDate, formatDate } from "../utils/helpers";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const Dashboard: React.FC = () => {
  const { records } = useAppContext();

  const stats = useMemo(() => {
    const total = records.length;
    const passed = records.filter(r => r.round2_status === "ผ่านการประเมิน").length;
    const pending = records.filter(r => r.round2_status === "รอดำเนินการ").length;
    const failed = records.filter(r => r.round2_status === "ไม่ผ่านการประเมิน").length;

    const today = new Date();
    const overdueRecords = records.filter(r => {
      const r1Overdue = r.round1_status === "รอดำเนินการ" && r.round1_end_date && parseISO(r.round1_end_date) < today;
      const r2Overdue = r.round2_status === "รอดำเนินการ" && r.round2_end_date && parseISO(r.round2_end_date) < today;
      return r1Overdue || r2Overdue;
    });
    const overdue = overdueRecords.length;

    // Status Chart Data
    const statusData = [
      { name: "ผ่านการประเมิน", value: passed, color: "#10B981" },
      { name: "รอดำเนินการ", value: pending, color: "#6B7280" },
      { name: "ไม่ผ่าน", value: failed, color: "#EF4444" },
    ].filter(d => d.value > 0);

    // Department Chart Data
    const deptCounts: Record<string, number> = {};
    records.forEach(r => {
      if (r.department) {
        deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
      }
    });
    const deptData = Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return { total, passed, pending, failed, overdue, overdueRecords, statusData, deptData };
  }, [records]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="พนักงานทั้งหมด" 
          value={stats.total} 
          icon={<Users size={20} />} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="ผ่านการประเมิน" 
          value={stats.passed} 
          icon={<CheckCircle size={20} />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="รอดำเนินการ" 
          value={stats.pending} 
          icon={<Clock size={20} />} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="เกินระยะเวลา" 
          value={stats.overdue} 
          icon={<AlertCircle size={20} />} 
          color="bg-rose-600" 
        />
        <StatCard 
          title="ไม่ผ่านการประเมิน" 
          value={stats.failed} 
          icon={<AlertTriangle size={20} />} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Upcoming */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" />
            พนักงานที่ใกล้ครบกำหนดประเมิน
          </h3>
          <div className="space-y-4">
            {records
              .filter(r => r.round2_status === "รอดำเนินการ" && r.round2_end_date && parseISO(r.round2_end_date) >= new Date())
              .sort((a, b) => parseISO(a.round2_end_date).getTime() - parseISO(b.round2_end_date).getTime())
              .slice(0, 5)
              .map(record => {
                const daysLeft = differenceInDays(parseISO(record.round2_end_date), new Date());
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm font-bold">
                        {record.first_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{record.title}{record.first_name} {record.last_name}</p>
                        <p className="text-xs text-gray-500">{record.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xs font-bold",
                        daysLeft <= 7 ? "text-red-500" : "text-amber-600"
                      )}>
                        เหลือเวลา {daysLeft} วัน
                      </p>
                      <p className="text-[10px] text-gray-400">ครบกำหนด: {formatDate(record.round2_end_date)}</p>
                    </div>
                  </div>
                );
              })}
            {records.filter(r => r.round2_status === "รอดำเนินการ" && r.round2_end_date && parseISO(r.round2_end_date) >= new Date()).length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm italic">ไม่มีรายการที่ใกล้ครบกำหนด</p>
            )}
          </div>
        </div>

        {/* Overdue Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100">
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-6 flex items-center gap-2">
            <AlertCircle size={18} />
            รายการที่เกินระยะเวลาที่กำหนด
          </h3>
          <div className="space-y-4">
            {stats.overdueRecords
              .slice(0, 5)
              .map(record => {
                const isR1Overdue = record.round1_status === "รอดำเนินการ" && record.round1_end_date && parseISO(record.round1_end_date) < new Date();
                const overdueDate = isR1Overdue ? record.round1_end_date : record.round2_end_date;
                const roundLabel = isR1Overdue ? "รอบที่ 1" : "รอบที่ 2";
                const daysOverdue = Math.abs(differenceInDays(parseISO(overdueDate), new Date()));

                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm font-bold">
                        {record.first_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{record.title}{record.first_name} {record.last_name}</p>
                        <p className="text-xs text-gray-500">{record.department} • <span className="font-bold text-red-600">{roundLabel}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">
                        เกินกำหนด {daysOverdue} วัน
                      </p>
                      <p className="text-[10px] text-gray-400">ครบเมื่อ: {formatDate(overdueDate)}</p>
                    </div>
                  </div>
                );
              })}
            {stats.overdue === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm italic">ไม่มีรายการที่เกินกำหนด</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">สัดส่วนสถานะการประเมิน</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">จำนวนพนักงานแยกตามสังกัด (Top 8)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;
