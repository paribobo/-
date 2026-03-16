import React from "react";
import { useAppContext } from "../context/AppContext";
import { formatThaiDate, formatDate, calculateProbationEnd } from "../utils/helpers";
import { parseISO } from "date-fns";

const ExportTemplates: React.FC = () => {
  const {
    filteredRecords,
    exportData,
    reportRef,
    individualReportRef
  } = useAppContext();

  return (
    <div className="fixed left-[-9999px] top-0">
      {/* Summary Template */}
      <div ref={reportRef} className="w-[210mm] p-[20mm] bg-white text-black font-sans">
        <div className="text-center mb-8 border-b-2 border-indigo-600 pb-4">
          <h1 className="text-2xl font-bold mb-1">รายงานสรุปผลการติดตามการทดลองงาน</h1>
          <p className="text-sm text-gray-600">ข้อมูล ณ วันที่ {formatThaiDate(new Date())}</p>
        </div>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">ที่</th>
              <th className="border border-gray-300 p-2 text-left">ชื่อ-นามสกุล / สังกัด</th>
              <th className="border border-gray-300 p-2 text-left">ตำแหน่ง</th>
              <th className="border border-gray-300 p-2 text-center">วันที่บรรจุ</th>
              <th className="border border-gray-300 p-2 text-center">รอบที่ 1</th>
              <th className="border border-gray-300 p-2 text-center">รอบที่ 2</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r.id}>
                <td className="border border-gray-300 p-2 text-center">{i + 1}</td>
                <td className="border border-gray-300 p-2">
                  <div>{r.title}{r.first_name} {r.last_name}</div>
                  <div className="text-[10px] text-gray-500">{r.department}</div>
                </td>
                <td className="border border-gray-300 p-2">{r.position}</td>
                <td className="border border-gray-300 p-2 text-center">{r.appointment_date ? formatThaiDate(parseISO(r.appointment_date)) : "-"}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {r.round1_status}
                  {r.round1_score && <div className="text-[10px] text-gray-500">คะแนน: {r.round1_score}</div>}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {r.round2_status}
                  {r.round2_score && <div className="text-[10px] text-gray-500">คะแนน: {r.round2_score}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-right text-[10px] text-gray-400">
          พิมพ์โดยระบบติดตามผลการทดลองงาน
        </div>
      </div>

      {/* Individual Template */}
      {exportData && (
        <div ref={individualReportRef} className="w-[210mm] p-[25mm] bg-white text-black font-sans">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold mb-2">บันทึกข้อความ</h1>
            <div className="border-b border-black w-full my-4"></div>
          </div>
          
          <div className="space-y-6 text-sm">
            <div className="flex justify-between">
              <p><strong>ส่วนราชการ:</strong> ฝ่ายบริหารทรัพยากรบุคคล</p>
              <p><strong>วันที่:</strong> {formatThaiDate(new Date())}</p>
            </div>
            <p><strong>เรื่อง:</strong> รายงานผลการประเมินการทดลองงานพนักงาน</p>
            
            <div className="border border-gray-200 p-6 rounded-lg space-y-4">
              <h2 className="font-bold border-b pb-2">ข้อมูลพนักงาน</h2>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>ชื่อ-นามสกุล:</strong> {exportData.title}{exportData.first_name} {exportData.last_name}</p>
                <p><strong>สังกัด:</strong> {exportData.department}</p>
                <p><strong>ตำแหน่ง:</strong> {exportData.position}</p>
                <p><strong>วันที่บรรจุ:</strong> {exportData.appointment_date ? formatThaiDate(parseISO(exportData.appointment_date)) : "-"}</p>
                <p><strong>ระยะเวลาทดลองงาน:</strong> {calculateProbationEnd(exportData.appointment_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold mb-3 text-indigo-600">การประเมินรอบที่ 1</h3>
                <p><strong>สถานะ:</strong> {exportData.round1_status}</p>
                {exportData.round1_score && <p><strong>คะแนน:</strong> {exportData.round1_score}</p>}
                <p><strong>ช่วงเวลา:</strong> {exportData.round1_start_date ? formatDate(exportData.round1_start_date) : "-"} ถึง {exportData.round1_end_date ? formatDate(exportData.round1_end_date) : "-"}</p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-bold mb-3 text-indigo-600">การประเมินรอบที่ 2</h3>
                <p><strong>สถานะ:</strong> {exportData.round2_status}</p>
                {exportData.round2_score && <p><strong>คะแนน:</strong> {exportData.round2_score}</p>}
                <p><strong>ช่วงเวลา:</strong> {exportData.round2_start_date ? formatDate(exportData.round2_start_date) : "-"} ถึง {exportData.round2_end_date ? formatDate(exportData.round2_end_date) : "-"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold border-b pb-2">คณะกรรมการประเมิน</h3>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {exportData.chairman && <li>ประธาน: {exportData.chairman}</li>}
                {exportData.committee1 && <li>กรรมการ: {exportData.committee1}</li>}
                {exportData.committee2 && <li>กรรมการ: {exportData.committee2}</li>}
                {exportData.committee3 && <li>กรรมการ: {exportData.committee3}</li>}
                {exportData.committee4 && <li>กรรมการ: {exportData.committee4}</li>}
                {exportData.secretary && <li>เลขานุการ: {exportData.secretary}</li>}
              </ul>
            </div>

            <div className="mt-20 flex flex-col items-end space-y-12">
              <div className="text-center w-64">
                <p className="mb-8">(ลงชื่อ)...........................................................</p>
                <p>( {exportData.chairman || "..........................................................."} )</p>
                <p>ประธานคณะกรรมการประเมิน</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTemplates;
