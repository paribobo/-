import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, Clock, Save, RefreshCw, AlertCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { POSITIONS, DEPARTMENTS, COMMITTEE_MEMBERS } from "../constants";
import { formatThaiDate, formatDate } from "../utils/helpers";
import { parseISO } from "date-fns";

const RecordModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    editingRecord,
    formData,
    setFormData,
    isSaving,
    saveError,
    handleSubmit,
    handleAppointmentDateChange
  } = useAppContext();

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-indigo-50/50">
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                {editingRecord ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
              </h2>
              <p className="text-sm text-[#6B7280]">กรอกรายละเอียดข้อมูลการทดลองงานให้ครบถ้วน</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-white rounded-full transition-colors text-[#6B7280]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Section: Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
                <User size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">ข้อมูลพื้นฐาน</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">คำนำหน้า</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  >
                    <option value="">เลือกคำนำหน้า</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="ว่าที่ร้อยตรี">ว่าที่ร้อยตรี</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">ชื่อ</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">นามสกุล</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">ตำแหน่ง</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  >
                    <option value="">เลือกตำแหน่ง...</option>
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">สังกัดงาน</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="">เลือกสังกัดงาน...</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">วันที่บรรจุ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                    <input 
                      type="date" 
                      required
                      className="w-full pl-10 pr-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.appointment_date}
                      onChange={e => handleAppointmentDateChange(e.target.value)}
                    />
                    {formData.appointment_date && (
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">
                        {formatThaiDate(parseISO(formData.appointment_date))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Evaluation Rounds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
                  <Clock size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">รอบที่ 1</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151] uppercase">สถานะ</label>
                    <select 
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.round1_status}
                      onChange={e => setFormData({...formData, round1_status: e.target.value})}
                    >
                      <option>รอดำเนินการ</option>
                      <option>ส่งหน้างานแล้ว</option>
                      <option>ส่งมหาลัยแล้ว</option>
                      <option>ผ่านการประเมิน</option>
                      <option>ไม่ผ่านการประเมิน</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151] uppercase">คะแนน</label>
                    <input 
                      type="text" 
                      placeholder="ระบุคะแนน..."
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.round1_score}
                      onChange={e => setFormData({...formData, round1_score: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#374151] uppercase">ตั้งแต่วันที่</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.round1_start_date}
                        onChange={e => setFormData({...formData, round1_start_date: e.target.value})}
                      />
                      {formData.round1_start_date && (
                        <p className="text-[9px] text-indigo-500 font-medium mt-0.5">
                          {formatDate(formData.round1_start_date)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#374151] uppercase">ถึงวันที่</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.round1_end_date}
                        onChange={e => setFormData({...formData, round1_end_date: e.target.value})}
                      />
                      {formData.round1_end_date && (
                        <p className="text-[9px] text-indigo-500 font-medium mt-0.5">
                          {formatDate(formData.round1_end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
                  <Clock size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">รอบที่ 2</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151] uppercase">สถานะ</label>
                    <select 
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.round2_status}
                      onChange={e => setFormData({...formData, round2_status: e.target.value})}
                    >
                      <option>รอดำเนินการ</option>
                      <option>ส่งหน้างานแล้ว</option>
                      <option>ส่งมหาลัยแล้ว</option>
                      <option>ผ่านการประเมิน</option>
                      <option>ไม่ผ่านการประเมิน</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#374151] uppercase">คะแนน</label>
                    <input 
                      type="text" 
                      placeholder="ระบุคะแนน..."
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.round2_score}
                      onChange={e => setFormData({...formData, round2_score: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#374151] uppercase">ตั้งแต่วันที่</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.round2_start_date}
                        onChange={e => setFormData({...formData, round2_start_date: e.target.value})}
                      />
                      {formData.round2_start_date && (
                        <p className="text-[9px] text-indigo-500 font-medium mt-0.5">
                          {formatDate(formData.round2_start_date)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#374151] uppercase">ถึงวันที่</label>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-[#D1D5DB] rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.round2_end_date}
                        onChange={e => setFormData({...formData, round2_end_date: e.target.value})}
                      />
                      {formData.round2_end_date && (
                        <p className="text-[9px] text-indigo-500 font-medium mt-0.5">
                          {formatDate(formData.round2_end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Committees */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-100 pb-2">
                <User size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">คณะกรรมการประเมิน</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">ประธาน</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.chairman}
                    onChange={e => setFormData({...formData, chairman: e.target.value})}
                  >
                    <option value="">เลือกประธาน...</option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">เลขานุการ</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.secretary}
                    onChange={e => setFormData({...formData, secretary: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">กรรมการ 1</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.committee1}
                    onChange={e => setFormData({...formData, committee1: e.target.value})}
                  >
                    <option value="">เลือกกรรมการ 1...</option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">กรรมการ 2</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.committee2}
                    onChange={e => setFormData({...formData, committee2: e.target.value})}
                  >
                    <option value="">เลือกกรรมการ 2...</option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">กรรมการ 3</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.committee3}
                    onChange={e => setFormData({...formData, committee3: e.target.value})}
                  >
                    <option value="">เลือกกรรมการ 3...</option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#374151] uppercase">กรรมการ 4</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.committee4}
                    onChange={e => setFormData({...formData, committee4: e.target.value})}
                  >
                    <option value="">เลือกกรรมการ 4...</option>
                    {COMMITTEE_MEMBERS.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex flex-col gap-3 sticky bottom-0 bg-white pb-2">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{saveError}</span>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-[#D1D5DB] rounded-lg text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>บันทึกข้อมูล</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RecordModal;
