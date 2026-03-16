import React from "react";
import { CheckCircle2 } from "lucide-react";
import { parseISO, isValid, format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "../utils/helpers";

interface StatusBadgeProps {
  status: string;
  startDate: string;
  endDate: string;
  score?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, startDate, endDate, score }) => {
  const formatDateLocal = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return "";
      const day = format(date, "d", { locale: th });
      const month = format(date, "MMM", { locale: th });
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
        status === "รอดำเนินการ" && "bg-[#F3F4F6] text-[#6B7280]",
        status === "ส่งหน้างานแล้ว" && "bg-blue-50 text-blue-600 border border-blue-100",
        status === "ส่งมหาลัยแล้ว" && "bg-purple-50 text-purple-600 border border-purple-100",
        status === "ผ่านการประเมิน" && "bg-emerald-50 text-emerald-600 border border-emerald-100",
        status === "ไม่ผ่านการประเมิน" && "bg-red-50 text-red-600 border border-red-100"
      )}>
        {status === "ผ่านการประเมิน" && <CheckCircle2 size={10} />}
        {status}
      </div>
      {score && (
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
          คะแนน: {score}
        </span>
      )}
      {(startDate || endDate) && (
        <div className="flex flex-col text-[9px] text-[#9CA3AF] font-medium leading-tight">
          {startDate && <span>เริ่ม: {formatDateLocal(startDate)}</span>}
          {endDate && <span>ครบ: {formatDateLocal(endDate)}</span>}
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
