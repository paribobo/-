import React from "react";
import { 
  Briefcase, 
  LayoutDashboard, 
  Table as TableIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Share2, 
  ExternalLink, 
  Bell 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { cn, formatThaiDate } from "../utils/helpers";

const Header: React.FC = () => {
  const {
    view, setView,
    searchTerm, setSearchTerm,
    roundFilter, setRoundFilter,
    handleSyncAll, handleSyncFromSheet,
    isLoading, isAdmin,
    isNotificationsOpen, setIsNotificationsOpen,
    notifications
  } = useAppContext();

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">ระบบติดตามผลการทดลองงาน</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-[#6B7280] uppercase tracking-wider font-medium">Probation Tracking System</p>
              <span className="text-[#E5E7EB]">|</span>
              <p className="text-[10px] text-indigo-600 font-bold">
                {formatThaiDate(new Date())}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#F3F4F6] p-1 rounded-xl">
          <button
            onClick={() => setView("dashboard")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              view === "dashboard" ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setView("tracking")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              view === "tracking" ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            <TableIcon size={18} />
            <span>ติดตามผล</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือตำแหน่ง..."
              className="pl-10 pr-4 py-2 bg-[#F3F4F6] border-none rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <select
              className="pl-9 pr-4 py-2 bg-[#F3F4F6] border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              value={roundFilter}
              onChange={(e) => setRoundFilter(e.target.value)}
            >
              <option value="all">รอบการประเมิน: ทั้งหมด</option>
              <option value="round1">รอบที่ 1 (รอดำเนินการ)</option>
              <option value="round2">รอบที่ 2 (รอดำเนินการ)</option>
              <option value="completed">ประเมินครบแล้ว</option>
            </select>
          </div>
          <button 
            onClick={handleSyncAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all shadow-sm disabled:opacity-50"
            title="ส่งข้อมูลทั้งหมดไปที่ Google Sheet"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">ส่งไป Sheet</span>
          </button>
          <button 
            onClick={handleSyncFromSheet}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-all shadow-sm disabled:opacity-50"
            title="ดึงข้อมูลทั้งหมดจาก Google Sheet"
          >
            <Download size={18} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">ดึงจาก Sheet</span>
          </button>
          <a 
            href={`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID || '1KWi5xixRRLFh0GmKLvoq0V5aGYVJRqv5ZxrMJllMwds'}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-all shadow-sm"
            title="เปิด Google Sheet"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">เปิด Sheet</span>
          </a>
          {process.env.VITE_GOOGLE_WEB_APP_URL && (
            <a 
              href={process.env.VITE_GOOGLE_WEB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-all shadow-sm"
              title="เปิด Google Web App"
            >
              <ExternalLink size={18} />
              <span className="hidden sm:inline">Web App</span>
            </a>
          )}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 text-[#6B7280] hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative"
              title="การแจ้งเตือน"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setIsNotificationsOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-30 overflow-hidden"
                  >
                    <div className="p-4 border-b border-[#E5E7EB] bg-gray-50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#111827]">การแจ้งเตือน</h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        {notifications.length} รายการ
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="mx-auto text-gray-300 mb-2" size={32} />
                          <p className="text-sm text-gray-500">ไม่มีการแจ้งเตือนใหม่</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={cn(
                              "p-4 border-b border-[#F3F4F6] hover:bg-gray-50 transition-all cursor-default",
                              notif.type === 'warning' ? "bg-amber-50/30" : ""
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                notif.type === 'warning' ? "bg-amber-500" : "bg-indigo-500"
                              )} />
                              <div>
                                <h4 className="text-xs font-bold text-[#111827] mb-1">{notif.title}</h4>
                                <p className="text-[11px] text-[#6B7280] leading-relaxed">{notif.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
