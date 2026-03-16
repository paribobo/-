import React from "react";
import { Download, Edit2, Trash2 } from "lucide-react";
import { parseISO } from "date-fns";
import { useAppContext } from "../context/AppContext";
import { formatThaiDate, calculateProbationEnd } from "../utils/helpers";
import StatusBadge from "./StatusBadge";

const DataTable: React.FC = () => {
  const {
    isLoading,
    filteredRecords,
    handleExportIndividual,
    handleOpenModal,
    handleDelete
  } = useAppContext();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">ที่</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">ชื่อ-นามสกุล</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">สังกัดงาน</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">ตำแหน่ง</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">วันที่บรรจุ</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">ครบ 6 เดือน</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-center">รอบที่ 1</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-center">รอบที่ 2</th>
              <th className="p-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-[#9CA3AF] text-sm italic">กำลังโหลดข้อมูล...</td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-[#9CA3AF] text-sm italic">ไม่พบข้อมูล</td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors group">
                  <td className="p-4 text-sm font-mono text-[#6B7280]">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#111827]">{record.title}{record.first_name} {record.last_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[#4B5563]">{record.department}</td>
                  <td className="p-4 text-sm text-[#4B5563]">{record.position}</td>
                  <td className="p-4 text-sm text-[#4B5563]">
                    {record.appointment_date ? formatThaiDate(parseISO(record.appointment_date)) : "-"}
                  </td>
                  <td className="p-4 text-sm font-medium text-indigo-600">
                    {calculateProbationEnd(record.appointment_date)}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge 
                      status={record.round1_status} 
                      startDate={record.round1_start_date} 
                      endDate={record.round1_end_date} 
                      score={record.round1_score}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge 
                      status={record.round2_status} 
                      startDate={record.round2_start_date} 
                      endDate={record.round2_end_date} 
                      score={record.round2_score}
                    />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => handleExportIndividual(record)}
                        className="p-2 text-[#6B7280] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="ส่งออก PDF รายบุคคล"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(record)}
                        className="p-2 text-[#6B7280] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
