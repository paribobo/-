import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { AppRecord, NotificationItem, ViewType } from "../types";
import { INITIAL_FORM_STATE } from "../constants";
import { parseISO, isValid, differenceInDays, format } from "date-fns";
import { formatThaiDate } from "../utils/helpers";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginError: string | null;
  setLoginError: (val: string | null) => void;
  records: AppRecord[];
  setRecords: (val: AppRecord[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  editingRecord: AppRecord | null;
  setEditingRecord: (val: AppRecord | null) => void;
  formData: typeof INITIAL_FORM_STATE;
  setFormData: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM_STATE>>;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  roundFilter: string;
  setRoundFilter: (val: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean) => void;
  view: ViewType;
  setView: (val: ViewType) => void;
  isSaving: boolean;
  setIsSaving: (val: boolean) => void;
  saveError: string | null;
  setSaveError: (val: string | null) => void;
  isExporting: boolean;
  setIsExporting: (val: boolean) => void;
  exportData: AppRecord | null;
  setExportData: (val: AppRecord | null) => void;
  reportRef: React.RefObject<HTMLDivElement>;
  individualReportRef: React.RefObject<HTMLDivElement>;
  
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleLogout: () => void;
  fetchRecords: () => Promise<void>;
  handleOpenModal: (record?: AppRecord | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: (id: number) => Promise<void>;
  handleSyncAll: () => Promise<void>;
  handleSyncFromSheet: () => Promise<void>;
  handleExportIndividual: (record: AppRecord) => Promise<void>;
  handleAppointmentDateChange: (dateStr: string) => void;
  filteredRecords: AppRecord[];
  notifications: NotificationItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [records, setRecords] = useState<AppRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AppRecord | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [searchTerm, setSearchTerm] = useState("");
  const [roundFilter, setRoundFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [view, setView] = useState<ViewType>("dashboard");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const individualReportRef = useRef<HTMLDivElement>(null);
  const [exportData, setExportData] = useState<AppRecord | null>(null);

  useEffect(() => {
    localStorage.setItem("isAdmin", isAdmin.toString());
  }, [isAdmin]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAdmin(true);
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        setLoginError(null);
        setPassword("");
        setUsername("");
      } else {
        setLoginError(data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      setLoginError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      setIsAdmin(false);
      localStorage.removeItem("isAdmin");
    }
  };

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/records");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (record: AppRecord | null = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        title: record.title,
        first_name: record.first_name,
        last_name: record.last_name,
        appointment_date: record.appointment_date,
        position: record.position,
        department: record.department || "",
        round1_status: record.round1_status,
        round1_start_date: record.round1_start_date,
        round1_end_date: record.round1_end_date,
        round1_score: record.round1_score || "",
        round2_status: record.round2_status,
        round2_start_date: record.round2_start_date,
        round2_end_date: record.round2_end_date,
        round2_score: record.round2_score || "",
        chairman: record.chairman,
        committee1: record.committee1,
        committee2: record.committee2,
        committee3: record.committee3,
        committee4: record.committee4,
        secretary: record.secretary
      });
    } else {
      setEditingRecord(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    const url = editingRecord ? `/api/records/${editingRecord.id}` : "/api/records";
    const method = editingRecord ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setIsModalOpen(false);
        fetchRecords();
      } else {
        const errorData = await response.json();
        setSaveError(errorData.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save record:", error);
      setSaveError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) return;
    try {
      const response = await fetch(`/api/records/${id}`, { method: "DELETE" });
      if (response.ok) fetchRecords();
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sync-all", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        alert(`ซิงค์ข้อมูลสำเร็จ ทั้งหมด ${data.count} รายการ`);
        fetchRecords();
      } else {
        alert("เกิดข้อผิดพลาดในการซิงค์ข้อมูล: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to sync records:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromSheet = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/sync-from-sheet", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        alert(`ดึงข้อมูลสำเร็จ ทั้งหมด ${data.count} รายการ`);
        fetchRecords();
      } else {
        alert(`${data.error}\n\nรายละเอียด: ${data.details || "ไม่ทราบสาเหตุ"}`);
      }
    } catch (error) {
      console.error("Failed to sync from sheet:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportIndividual = async (record: AppRecord) => {
    setExportData(record);
    setIsExporting(true);
    
    // Wait for state update and render
    setTimeout(async () => {
      if (!individualReportRef.current) {
        setIsExporting(false);
        return;
      }
      try {
        const canvas = await html2canvas(individualReportRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`รายงานผลการทดลองงาน-${record.first_name}-${record.last_name}.pdf`);
      } catch (error) {
        console.error("Export failed:", error);
        alert("เกิดข้อผิดพลาดในการส่งออก PDF");
      } finally {
        setIsExporting(false);
        setExportData(null);
      }
    }, 500);
  };

  const handleAppointmentDateChange = (dateStr: string) => {
    if (!dateStr) {
      setFormData({
        ...formData,
        appointment_date: "",
        round1_start_date: "",
        round1_end_date: "",
        round2_start_date: "",
        round2_end_date: ""
      });
      return;
    }

    const date = parseISO(dateStr);
    if (!isValid(date)) return;

    // Round 1: 0-3 months
    const r1Start = new Date(date);
    const r1End = new Date(date);
    r1End.setMonth(r1End.getMonth() + 3);
    r1End.setDate(r1End.getDate() - 1);

    // Round 2: 3-6 months
    const r2Start = new Date(date);
    r2Start.setMonth(r2Start.getMonth() + 3);
    const r2End = new Date(date);
    r2End.setMonth(r2End.getMonth() + 6);
    r2End.setDate(r2End.getDate() - 1);

    setFormData({
      ...formData,
      appointment_date: dateStr,
      round1_start_date: format(r1Start, "yyyy-MM-dd"),
      round1_end_date: format(r1End, "yyyy-MM-dd"),
      round2_start_date: format(r2Start, "yyyy-MM-dd"),
      round2_end_date: format(r2End, "yyyy-MM-dd")
    });
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      if (roundFilter === "all") return true;
      if (roundFilter === "round1") return r.round1_status === "รอดำเนินการ";
      if (roundFilter === "round2") return r.round2_status === "รอดำเนินการ" && r.round1_status !== "รอดำเนินการ";
      if (roundFilter === "completed") return r.round1_status !== "รอดำเนินการ" && r.round2_status !== "รอดำเนินการ";
      
      return true;
    });
  }, [records, searchTerm, roundFilter]);

  const notifications = useMemo(() => {
    const today = new Date();
    const list: NotificationItem[] = [];
    records.forEach(record => {
      if (record.round1_end_date && record.round1_status === "รอดำเนินการ") {
        const endDate = parseISO(record.round1_end_date);
        const daysLeft = differenceInDays(endDate, today);
        if (daysLeft >= 0 && daysLeft <= 15) {
          list.push({
            id: `r1-${record.id}`,
            title: `ประเมินรอบที่ 1: ${record.first_name} ${record.last_name}`,
            description: `ครบกำหนดในอีก ${daysLeft} วัน (${formatThaiDate(endDate)})`,
            date: record.round1_end_date,
            type: daysLeft <= 5 ? 'warning' : 'info'
          });
        }
      }
      if (record.round2_end_date && record.round2_status === "รอดำเนินการ") {
        const endDate = parseISO(record.round2_end_date);
        const daysLeft = differenceInDays(endDate, today);
        if (daysLeft >= 0 && daysLeft <= 15) {
          list.push({
            id: `r2-${record.id}`,
            title: `ประเมินรอบที่ 2: ${record.first_name} ${record.last_name}`,
            description: `ครบกำหนดในอีก ${daysLeft} วัน (${formatThaiDate(endDate)})`,
            date: record.round2_end_date,
            type: daysLeft <= 5 ? 'warning' : 'info'
          });
        }
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  return (
    <AppContext.Provider value={{
      isAdmin, setIsAdmin, username, setUsername, password, setPassword, loginError, setLoginError,
      records, setRecords, isModalOpen, setIsModalOpen, editingRecord, setEditingRecord,
      formData, setFormData, searchTerm, setSearchTerm, roundFilter, setRoundFilter,
      isLoading, setIsLoading, isNotificationsOpen, setIsNotificationsOpen, view, setView,
      isSaving, setIsSaving, saveError, setSaveError, isExporting, setIsExporting,
      exportData, setExportData, reportRef, individualReportRef,
      handleLogin, handleLogout, fetchRecords, handleOpenModal, handleSubmit,
      handleDelete, handleSyncAll, handleSyncFromSheet, handleExportIndividual,
      handleAppointmentDateChange,
      filteredRecords, notifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
