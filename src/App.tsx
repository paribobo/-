import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Calendar, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  X,
  Save,
  Filter,
  Share2,
  RefreshCw,
  AlertCircle,
  Bell,
  Info,
  FileText,
  Download,
  ExternalLink,
  Printer,
  LayoutDashboard,
  Table as TableIcon,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Lock,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, addMonths, parseISO, isValid, differenceInDays } from "date-fns";
import { th } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AppRecord {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  appointment_date: string;
  position: string;
  department: string;
  department_unit: string;
  round1_status: string;
  round1_start_date: string;
  round1_end_date: string;
  round2_status: string;
  round2_start_date: string;
  round2_end_date: string;
  chairman: string;
  committee1: string;
  committee2: string;
  committee3: string;
  committee4: string;
  secretary: string;
  round1_score?: string;
  round2_score?: string;
  employment_type: string;
  created_at: string;
}

const INITIAL_FORM_STATE = {
  title: "",
  first_name: "",
  last_name: "",
  appointment_date: "",
  position: "",
  department: "",
  department_unit: "",
  employment_type: "",
  round1_status: "รอดำเนินการ",
  round1_start_date: "",
  round1_end_date: "",
  round1_score: "",
  round2_status: "รอดำเนินการ",
  round2_start_date: "",
  round2_end_date: "",
  round2_score: "",
  chairman: "",
  committee1: "",
  committee2: "",
  committee3: "",
  committee4: "",
  secretary: "นางสาวชยาภัสร์ ไกรเดช"
};

const EMPLOYMENT_TYPES = [
  "พนักงานมหาวิทยาลัย (เงินรายได้)",
  "พนักงานมหาวิทยาลัย (เงินแผ่นดิน)",
  "พนักงานราชการ (เงินรายได้)"
];

const POSITIONS = [
  "ศาสตราจารย์",
  "รองศาสตราจารย์",
  "ผู้ช่วยศาสตราจารย์",
  "อาจารย์",
  "ผู้มีความรู้ความสามารถพิเศษเป็นอาจารย์ในมหาวิทยาลัย",
  "ผู้บริหาร",
  "แพทย์",
  "พยาบาล",
  "นักกายภาพบำบัด",
  "นักกายอุปกรณ์",
  "นักกิจกรรมบำบัด",
  "นักจิตวิทยาคลินิก",
  "นักเทคนิคการแพทย์",
  "นักเทคโนโลยีหัวใจและทรวงอก",
  "นักรังสีการแพทย์",
  "นักเวชศาสตร์การสื่อความหมาย",
  "เภสัชกร",
  "คนสวน",
  "เจ้าหน้าที่บริหารงานทั่วไป",
  "เจ้าหน้าที่วิจัย",
  "เจ้าหน้าที่เวชระเบียน",
  "ช่างเทคนิค",
  "นักประชาสัมพันธ์",
  "นักวิเคราะห์นโยบายและแผน",
  "นักวิจัย",
  "นักวิชาการคอมพิวเตอร์",
  "นักวิชาการเงินและบัญชี",
  "นักวิชาการพัสดุ",
  "นักวิชาการโภชนาการ",
  "นักวิชาการมาตรฐานคุณภาพ",
  "นักวิทยาศาสตร์การแพทย์",
  "นักวิชาการวิทยาศาสตร์การแพทย์",
  "นักวิชาการเวชสถิติ",
  "นักวิชาการศึกษา",
  "นักวิชาการสถิติ",
  "นักวิชาการสาธารณสุข",
  "นักวิชาการโสตทัศนศึกษา",
  "นักวิทยาศาสตร์",
  "นักวิเทศสัมพันธ์",
  "นักสังคมสงเคราะห์",
  "นิติกร",
  "บรรณารักษ์",
  "บุคลากร",
  "ผู้ปฏิบัติงานบริหาร",
  "ผู้ปฏิบัติงานพยาบาล",
  "ผู้ปฏิบัติงานเภสัชกรรม",
  "ผู้ปฏิบัติงานโสตทัศนศึกษา",
  "พนักงานขับรถยนต์",
  "พนักงานช่วยเหลือคนไข้",
  "พนักงานทั่วไป",
  "พนักงานธุรการ",
  "พนักงานเปล",
  "พนักงานพัสดุ",
  "พนักงานรับโทรศัพท์",
  "พนักงานห้องบัตร",
  "พนักงานห้องปฏิบัติการ",
  "วิศวกร",
  "สถาปนิก"
];

const COMMITTEE_MEMBERS = [
  "คณบดีคณะแพทยศาสตร์",
  "รองคณบดีฝ่ายบริหารและประกันคุณภาพ",
  "รองคณบดีฝ่ายการคลัง",
  "รองคณบดีฝ่ายทรัพยากรบุคคล",
  "รองคณบดีฝ่ายวิชาการ",
  "รองคณบดีฝ่ายคุณภาพและวิจัย",
  "รองคณบดีฝ่ายกิจการนิสิต",
  "รองคณบดีฝ่ายพัสดุ",
  "หัวหน้าสำนักงานเลขานุการคณะแพทยศาสตร์",
  "หัวหน้าภาควิชากุมารเวชศาสตร์",
  "หัวหน้าภาควิชาจักษุวิทยา",
  "หัวหน้าภาควิชาจิตเวชศาสตร์",
  "หัวหน้าภาควิชาพยาธิวิทยา",
  "หัวหน้าภาควิชารังสีวิทยา",
  "หัวหน้าภาควิชาวิสัญญีวิทยา",
  "หัวหน้าภาควิชาเวชศาสตร์ชุมชน",
  "หัวหน้าภาควิชาศัลยศาสตร์",
  "หัวหน้าภาควิชาสูติศาสตร์-นรีเวชวิทยา",
  "หัวหน้าภาควิชาออร์โธปิดิกส์",
  "หัวหน้าภาควิชาอายุรศาสตร์",
  "หัวหน้าภาควิชาเวชศาสตร์ฟื้นฟู",
  "หัวหน้าภาควิชาเวชศาสตร์ครอบครัว",
  "รักษาการในตำแหน่งผู้อำนวยการศูนย์พัฒนลักษณ์",
  "รักษาการในตำแหน่งผู้อำนวยการโรงพยาบาลมหาวิทยาลัยนเรศวร คณะแพทยศาสตร์",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายประกันสุขภาพ",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายการพยาบาล",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายพยาธิวิทยาคลินิก",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายบริการ",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายเภสัชกรรม",
  "ผู้ช่วยคณบดีฝ่ายประกันคุณภาพการศึกษา",
  "ผู้ช่วยคณบดีฝ่ายบริหารเทคโนโลยีสารสนเทศ",
  "ผู้ช่วยคณบดีฝ่ายพัฒนานวัตกรรม",
  "ผู้ช่วยคณบดีฝ่ายการคลัง",
  "ผู้ช่วยคณบดีฝ่ายพัฒนาทรัพยากรบุคคล",
  "ผู้ช่วยคณบดีฝ่ายบริหารการศึกษา",
  "ผู้ช่วยคณบดีฝ่ายการศึกษาก่อนปริญญาชั้นปรีคลินิก",
  "ผู้ช่วยคณบดีฝ่ายการศึกษาหลังปริญญา",
  "ผู้ช่วยคณบดีฝ่ายวิจัย",
  "ผู้ช่วยคณบดีฝ่ายบริหารงานวิจัย",
  "ผู้ช่วยคณบดีฝ่ายประกันคุณภาพ",
  "ผู้ช่วยคณบดีฝ่ายคุณภาพบริการ",
  "ผู้ช่วยคณบดีฝ่ายพัสดุ",
  "ผู้ช่วยคณบดีฝ่ายบริหารจัดการทรัพย์สิน",
  "ผู้ช่วยคณบดีฝ่ายนโยบายและแผน",
  "รักษาการในตำแหน่งรองคณบดีฝ่ายคลินิก โรงพยาบาลอุตรดิตถ์",
  "รักษาการในตำแหน่งรองคณบดีฝ่ายคลินิก โรงพยาบาลสมเด็จพระเจ้าตากสินมหาราช",
  "รักษาการในตำแหน่งรองคณบดีฝ่ายคลินิก โรงพยาบาลแพร่",
  "รักษาการในตำแหน่งรองคณบดีฝ่ายคลินิก โรงพยาบาลพุทธชินราชพิษณุโลก",
  "รักษาการในตำแหน่งรองคณบดีฝ่ายคลินิก โรงพยาบาลพิจิตร",
  "ที่ปรึกษาคณบดีคณะแพทยศาสตร์",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าฝ่ายจัดเก็บรายได้และงานการเงิน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าฝ่ายงบประมาณและรายจ่าย",
  "ปฏิบัติหน้าที่ในตำแหน่งรองหัวหน้าฝ่ายการพยาบาลด้านบริหาร",
  "ปฏิบัติหน้าที่ในตำแหน่งรองหัวหน้าฝ่ายการพยาบาลด้านวิชาการ",
  "ปฏิบัติหน้าที่ในตำแหน่งรองหัวหน้าฝ่ายการพยาบาลด้านบริการผู้ป่วยนอก",
  "ปฏิบัติหน้าที่ในตำแหน่งรองหัวหน้าฝ่ายการพยาบาลด้านบริการผู้ป่วยใน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยสารบรรณและยานพาหนะ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเลขานุการผู้บริหาร",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยนิติการ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริหารและประกันคุณภาพ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยอาคารสถานที่",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยนโยบายและแผน",
  "รักษาการในตำแหน่งหัวหน้างานบริหารเทคโนโลยีสารสนเทศและนวัตกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเทคโนโลยีบริการ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริการสารสนเทศและฝึกอบรม",
  "รักษาการในตำแหน่งหัวหน้างานคลัง",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยรายรับ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยแคชเชียร์",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยรายจ่ายและทดรองจ่าย",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบัญชี",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยธุรการคลังและพัสดุ",
  "รักษาการในตำแหน่งหัวหน้างานพัสดุ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยจัดซื้อและบริหารสัญญา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริหารพัสดุ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยพัฒนาและดูแลสินทรัพย์",
  "รักษาการในตำแหน่งหัวหน้างานทรัพยากรบุคคล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริหารทรัพยากรบุคคล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยพัฒนาทรัพยากรบุคคล",
  "รักษาการในตำแหน่งหัวหน้างานบริการการศึกษา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริหารการศึกษา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยจัดการศึกษาก่อนปริญญาชั้นปรีคลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยจัดการศึกษาก่อนปริญญาชั้นคลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยการศึกษาหลังปริญญา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยสนับสนุนการศึกษาและประกันคุณภาพการศึกษา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยวัดและประเมินผล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยโสตทัศนูปกรณ์และเทคโนโลยีการศึกษา",
  "รักษาการในตำแหน่งหัวหน้างานกิจการนิสิต",
  "รักษาการในตำแหน่งหัวหน้างานวิจัย",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริหารและจัดการงานวิจัย",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยวิจัยพื้นฐานทางการแพทย์",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยสื่อสารองค์กร",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยวิเทศสัมพันธ์",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลเวชศาสตร์ป้องกัน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยธุรการโรงพยาบาล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยต้อนรับและสื่อสารบริการ",
  "รักษาการในตำแหน่งหัวหน้างานเครื่องมือแพทย์",
  "รักษาการในตำแหน่งหัวหน้าศูนย์โรคหัวใจ",
  "รักษาการในตำแหน่งหัวหน้าศูนย์วิจัยโลหิตวิทยา",
  "รักษาการในตำแหน่งหัวหน้าศูนย์ปลูกถ่ายกระจกตาและผ่าตัดแก้ไขสายตา",
  "รักษาการในตำแหน่งหัวหน้าศูนย์โรคไต",
  "รักษาการในตำแหน่งหัวหน้าศูนย์รักษาผู้มีบุตรยาก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยโภชนบริการ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยโภชนบำบัด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยกายภาพบำบัด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยกิจกรรมบำบัดและกายอุปกรณ์",
  "รักษาการในตำแหน่งหัวหน้างานรังสีวิทยา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริการภาพวินิจฉัยและรังสีร่วมรักษา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยรังสีรักษา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยธุรการรังสีวิทยา",
  "รักษาการในตำแหน่งหัวหน้างานผลิตยา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยผลิตยาปราศจากเชื้อและยาเคมีบำบัด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริการผู้ป่วยนอก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริบาลผู้ป่วยนอกเฉพาะโรค",
  "รักษาการในตำแหน่งหัวหน้างานบริการและบริบาลผู้ป่วยใน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริการผู้ป่วยใน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบริบาลผู้ป่วยใน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยพัฒนาระบบยาและนโยบายด้านยา",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเภสัชสนเทศ",
  "รักษาการในตำแหน่งหัวหน้างานประกันสุขภาพ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยหลักประกันสุขภาพ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยสวัสดิการสังคม",
  "รักษาการในตำแหน่งหัวหน้างานคุณภาพเวชระเบียน",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเวชระเบียนผู้ป่วยในและรหัสโรค",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเวชระเบียนผู้ป่วยนอก",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลผู้ป่วยนอก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยผู้ป่วยนอก 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยผู้ป่วยนอก 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยบำบัดระยะสั้น",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยไตเทียม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยอุบัติเหตุ-ฉุกเฉิน",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลผ่าตัดและวิสัญญี",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยผ่าตัด",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลศัลยกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยศัลยกรรม 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยศัลยกรรม 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษศัลยกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยจักษุ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยโสต ศอ นาสิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยศัลยกรรมกระดูกและข้อ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษศัลยกรรมกระดูกและข้อ",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลอายุรกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยโรคหัวใจ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยอายุรกรรม 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยอายุรกรรม 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษอายุรกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษทั่วไป 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษทั่วไป 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยปฏิบัติการตรวจสวนหัวใจและหลอดเลือด",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลสูติ-นรีเวชกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยห้องคลอด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยสูติ-นรีเวชกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยพิเศษสูติ-นรีเวชกรรม",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลกุมารเวชกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยกุมารเวชกรรม 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยกุมารเวชกรรม 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยกุมารเวชกรรม 3",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตทารกแรกเกิด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตกุมารเวชกรรม",
  "รักษาการในตำแหน่งหัวหน้างานสนับสนุนการพยาบาล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเวชภัณฑ์ปลอดเชื้อกลาง",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยสร้างเสริมสุขภาพและควบคุมโรค",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยอาชีวอนามัย",
  "รักษาการในตำแหน่งหัวหน้างานการพยาบาลวิกฤต",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตศัลยกรรมหัวใจและทรวงอก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตศัลยกรรมทั่วไป 1",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตศัลยกรรมทั่วไป 2",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตอายุรกรรม",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตหัวใจและหลอดเลือด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหอผู้ป่วยวิกฤตระบบทางเดินหายใจ",
  "รักษาการในตำแหน่งหัวหน้างานห้องปฏิบัติการกลาง",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยโลหิตวิทยาและจุลทรรศนศาสตร์คลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยเคมีคลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยห้องปฏิบัติการผู้ป่วยนอก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยภูมิคุ้มกันวิทยาคลินิก",
  "รักษาการในตำแหน่งหัวหน้างานชันสูตรโรคติดเชื้อ",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยจุลชีววิทยาคลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยอณูชีววิทยาคลินิก",
  "รักษาการในตำแหน่งหัวหน้างานธนาคารเลือด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยรับบริจาคเลือด",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยห้องปฏิบัติการธนาคารเลือด",
  "รักษาการในตำแหน่งหัวหน้างานพยาธิวิทยากายวิภาค",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าหน่วยพยาธิวินิจฉัย",
  "รักษาการในตำแหน่งหัวหน้าภาควิชาโสต ศอ นาสิกวิทยา",
  "รักษาการในตำแหน่งหัวหน้าภาควิชานิติเวชศาสตร์",
  "รักษาการในตำแหน่งหัวหน้างานอำนวยการและสนับสนุนการบริหาร",
  "รักษาการในตำแหน่งรองผู้อำนวยการฝ่ายบริหาร",
  "รักษาการในตำแหน่งหัวหน้าศูนย์มะเร็ง",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าฝ่ายการพยาบาล",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าฝ่ายพยาธิวิทยาคลินิก",
  "ปฏิบัติหน้าที่ในตำแหน่งหัวหน้าฝ่ายเภสัชกรรม",
  "รักษาการในตำแหน่งหัวหน้างานบริการและบริบาลผู้ป่วยนอก",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยวิเคราะห์และพัฒนานวัตกรรม",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยจัดซื้อยา",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยระบาดวิทยาคลินิกและสถิติศาสตร์คลินิก",
  "รักษาการ in ตำแหน่งหัวหน้างานบริหาร",
  "ปฏิบัติหน้าที่ in ตำแหน่งรองหัวหน้าฝ่ายการพยาบาลด้านพัฒนาคุณภาพ",
  "รักษาการ in ตำแหน่งหัวหน้างานบริหารเวชภัณฑ์ยา",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยทดลองทางคลินิก",
  "รักษาการ in ตำแหน่งหัวหน้างานเภสัชสนเทศและคุณภาพระบบยา",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยบริหารความเสี่ยง",
  "รักษาการ in ตำแหน่งหัวหน้างานพัฒนาคุณภาพบริการ",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยคลังยา",
  "ปฏิบัติหน้าที่ in ตำแหน่งหัวหน้าหน่วยเภสัชปฐมภูมิ",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงพิริยา นฤขัตรพิชัย",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์พีระพงษ์ เธียราวัฒน์",
  "นายแพทย์วินัฐ แก้วตัน",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงชนิดา จันทร์ทิม",
  "รองศาสตราจารย์ แพทย์หญิงจิรนันท์ วีรกุล",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์จตุวิทย์ หอวรรณภากร",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์รวิสุต เดียวอิศเรศ",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์ภูศิษฏ์ เรืองวาณิชยกุล",
  "นางสาวสุกัญญา ประดิษฐ์",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงกาญจ์รวี สังข์เปรม",
  "นายแพทย์คณินท์ เหลืองสว่าง",
  "แพทย์หญิงฟ้าสินี อรุณโรจน์ปัญญา",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์พีรยุทธ สิทธิไชยากุล",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงรวิวรรณ พัทธวีรกุล",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงอินทิพร โฆษิตานุฤทธิ์",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์ธัชชัย ศรีเสน",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์สิรภพ ทัพมงคล",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์สุรชัย เดชอาคม",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์ศรัณย์ มะลิซ้อน",
  "ผู้ช่วยศาสตราจารย์.ดร.นายแพทย์อภิรัตน์ หวังธีระประเสริฐ",
  "แพทย์หญิงสุวรรณิการ์ ปาลี",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์นนท์ โสวัณณะ",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์ศรัณย์ วรศักดิ์วุฒิพงษ์",
  "นายแพทย์พิเชษฐ์ วัฒนไพโรจน์รัตน์",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์วิทวัส จิตต์ผิวงาม",
  "นางเนตรญา วิโรจวานิช",
  "แพทย์หญิงธันยาสิริ จินดายก",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์พรเทพ รัชฎาภรณ์กุล",
  "เภสัชกร หญิงนิสา หวังเรืองสถิตย์",
  "รองศาสตราจารย์ แพทย์หญิงธิติมา เงินมาก",
  "เภสัชกรพศวีร์ รัตนพยุงสถาพร",
  "เภสัชกรพิชญ์สิทธิ์ อุดมนุชัยทรัพย์",
  "เภสัชกร หญิงขวัญชนก อารีย์วงศ์",
  "เภสัชกรดร.ทรงศักดิ์ ทองสนิท",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงแพรว สุวรรณศรีสุข",
  "ผู้ช่วยศาสตราจารย์ นายแพทย์จิโรจน์ จิรานุกูล",
  "รองศาสตราจารย์ แพทย์หญิงวรวรรณ จิตต์ธรรม",
  "รองศาสตราจารย์ นายแพทย์อาทิตย์ เหล่าเรืองธนา",
  "นายแพทย์ธานินทร์ ฉัตราภิบาล",
  "เภสัชกร หญิงกนกวรรณ แพรขาว",
  "นางมนฑนัฎฐ์ ปาละ",
  "เภสัชกรชัยวัฒน์ บูรณะชนอาภา",
  "นายวินัย พ่วงกระทุ่ม",
  "นายแพทย์ไพสิฐ โกสุม",
  "นายแพทย์ฐิติพงศ์ ภู่ประเสริฐ",
  "ผศ.(พิเศษ) นายแพทย์ชัยกิจ อุดแน่น",
  "ผศ.(พิเศษ) นายแพทย์พรชัย ลิ้มกมลทิพย์",
  "แพทย์หญิงวรรณา อาจองค์",
  "นายแพทย์พีรพงศ์ โรจน์ธนพิบูล",
  "ศ.ดร.นายแพทย์ชยันตร์ธร ปทุมานนท์",
  "นางวลุลี โพธิรังสิยากร",
  "ผศ.ดร.ดิชพงศ์ พงศ์ภัทรชัย",
  "นายปรากฏ ลิมปกาญจน์",
  "นางสาวสวลักษณ์ แสงเดช",
  "นางสาวขนิษฐา เมฆอรุณกมล",
  "นางสาวธงวิไล กันทะสอน",
  "นางสาวอชิรญาน์ ศรีพัฒนาวัฒน์",
  "นางภัทราวรรณ สุพรรณไพบูลย์",
  "นางสาวอมรรัตน์ สมมิตร",
  "นางธีรนุช เมฆนันทไพศิฐ",
  "นางสาวปิยนันท์ นวมครุฑ",
  "นางสาวขวัญชนก ป้องอ้วน",
  "นายสุทธิพงษ์ วงวิริยะ",
  "นายรัตนสินทร์ สงพูล",
  "นางสาวปนัดดา ประจำเมือง",
  "นายธนากร พงษ์ปลื้ม",
  "นายรินทร์ณภัทร โตคำ",
  "นายธนพล แก้วคำปา",
  "นางสาวรุ่งนภา พุ่มชม",
  "นางศรีรัตน์ เฉลิมวัฒนชัย",
  "นางลภัสรดา พีระโรจน์พิทักษ์",
  "นางสาวรติกร ตันติเสวี",
  "นางสาวสุพัตรา สลีวงศ์",
  "นางกนกอร มุกดาลอย",
  "นางสาวหงษ์ทอง พละทรัพย์",
  "นางสาวอังสนาพร เกษมรัตน์",
  "นายวัฒนกูล คงสวัสดิ์",
  "นางสาวพิมลวัลย์ พงษ์มณี",
  "นางสาวศิริบังอร ต่อวิเศษ",
  "นางสาวชยาภัสร์ ไกรเดช",
  "นางสาวปิยะวรรณ สายทอง",
  "นางสาววันดี ทับทิม",
  "นางสาวเสาวนาถ สันติชาติ",
  "นางอัญพร รุ่งรัตนไชย",
  "นางวงศ์ตะวัน ภู่เจริญ",
  "นางสาวภาวินี เย็นใจ",
  "นางสาวพัชกาญจน์ เชื้อสกุล",
  "นางสาวธรารัตน์ รณหงษา",
  "นายเกรียงศักดิ์ พลทอง",
  "นายฤทธิรงค์ แสนพรม",
  "นางสาวปรารถนา เอนกปัญญากุล",
  "นายทินกรณ์ หาญณรงค์",
  "นางสาวศิริรัตน์ บุญอาษา",
  "นางสาวจามรี อ่อนโฉม",
  "นางสาวจุฑารัตน์ ราชพริ้ง",
  "นางสาวสมศรี คำพันธ์",
  "นางสาวพัชรา ชิราวัฒน์",
  "นางจีราวรรณ แสงทอง",
  "นายไกรพล ภักดีภูวนารถ",
  "รองศาสตราจารย์ นายแพทย์จรัญ สายะสถิตย์",
  "รองศาสตราจารย์ นายแพทย์พีระพล วอง",
  "ผู้ช่วยศาสตราจารย์ แพทย์หญิงจีราวัฒน์ สวัสดิวิทยะยง",
  "ดร.แพทย์หญิงวัชรา พิจิตรศิริ",
  "ผู้ช่วยศาสตราจารย์ ดร.แพทย์หญิงพัชรดา อมาตยกุล",
  "นางสาวประกายดาว แก้วทองโต",
  "นางสาวศิริวรรณ สังเวียน",
  "นางสาวดุลย์โสภา ชัยรัตน์",
  "นางสาวจิรพรรณ พุทธิไพศาล",
  "นายวีรวัตร แสนบุญเลิง",
  "นางสาววัชดาภรณ์ จันทร์ทับหลวง",
  "นางสาวกมลชนก นอบเผือก",
  "นางสาวรัฐภรณ์ อินทร์ปินตา",
  "เภสัชกร หญิงยุพา โม้พวง",
  "เภสัชกรอภิชัย มาน้อย",
  "เภสัชกร หญิงชนิดา เปี่ยมลาภโชติกุล",
  "เภสัชกร หญิงกนกวรรณ บูรณะชนอาภา",
  "เภสัชกร หญิงภิวดี ขุนมธุรส",
  "เภสัชกรธราพงษ์ อ่วมอ่ำ",
  "เภสัชกรกาลัญญู เปี่ยมลาภโชติกุล",
  "เภสัชกร หญิงกันยาวัฒน์ วงศ์พุฒิ",
  "เภสัชกร หญิงศิรดา แสวงผล",
  "นางวสี เลิศขจรสิน",
  "นางชลกนก อ้มพรม",
  "นางสาวหฤทัย คนขยัน",
  "นางสุภาวดี พงษ์หนาด",
  "นางสาววรรณา วงศ์จำปา",
  "นางสาวพันธ์ทิพย์ แสงทอง",
  "นางสาววารี ทองเนื้ออ่อน",
  "นางสาวแสงระวี อำรุง",
  "นางสาวรัตติยา สุวรรณเดชา",
  "นางสาวจันทรา คงเจริญ",
  "นางสายรุ้ง บุตรเจริญไพศาล",
  "นางสาวทิพวรรณ เรืองชูพงศ์",
  "นายวราพงษ์ ทาตุ้ย",
  "นางสาวพีรชญา ทองปลิว",
  "นางวรรณา พิมพานุวัตร",
  "นางสาวลำจวน เขียวขำ",
  "นางสาวกรรณิการ์ ธนูน้อย",
  "นางสาวรัชนีวรรณ แก้วทอง",
  "นางอังกฤษ อุ่นเมือง",
  "นางยุพดี ฟองชัย",
  "นางสาวอัยลิศา วัฒนาณรงค์",
  "นางสาวอรนุช ไกรกิจราษฎร์",
  "นางมณีรัตน์ ฟักเอม",
  "นางจิดาภา ตั้งปัญญาวงศ์",
  "นางสาวปณิธาน เดชรักษา",
  "นางสาวยุพิน ดอกไม้",
  "นางสาวสุดาภรณ์ ตาคำเที่ยง",
  "นางสาวนิตยา เนียมหอม",
  "นางสาวอัญชลี โตเอี่ยม",
  "นางสาววรีรัตน์ เฉลิมทอง",
  "นางสาวคนึงนิตย์ อ่อนปาน",
  "นางดารุณี ฮาวกันทะ",
  "นางรตีภัทร รัตนบวรวัฒ",
  "นางสาวสุขุมาล แสงอรุณ",
  "นางปราณี วัฒนวิบูลย์ไพศาล",
  "นางสาวนลัทพร รวดเร็ว",
  "นางวิภารัตน์ แก้วยม",
  "นางสาวสุวรรณา ภู่ทิม",
  "นางสุพัตรา ทิพย์สุวรรณ",
  "นางสาวลำดวน การะพิน",
  "นางพิมพ์ชนก พูลเพิ่ม",
  "นางสาวกนกพร วิลาชัย",
  "นางสาวน้ำหวาน ทองดี",
  "นางสาวปุณญริดา สวนภักดี",
  "นางสาวนิภาพร พรหมมีเนตร",
  "นางวันดี เครือยา",
  "นางสาวรัชณีพร สุขสวัสดิ์",
  "นางวัลยา ภาคภูมิ",
  "นางปัทมา วงษ์กียู้",
  "นางสาวกฤษณภัค อินทศรี",
  "นางสาววรรษมณ สวนอภัย",
  "นางสาวธิดารัตน์ เทพจันทร์",
  "นายกษิดิศ จันท้วม",
  "นางสาวสุขุมาล นิยมธรรม",
  "นางสาวอัญชิสา อรุณมาศ",
  "นางอัจฉรา บุญสิทธิ์",
  "นางสาวธนัชพร ชื่นเกษร",
  "นางสาวภัทร์สรรพ์พร นนท์ธราธร",
  "นางสาวอรวรรณ ศรีหลักคำ",
  "นางสาวสุธิดา ศาสตร์จีนพงษ์",
  "นางสาวประภาศรี วิญญารักษ์",
  "นายพีรวัฒน์ แก้วกาหลง",
  "นางประมวล นาคผู้",
  "นางสาวขนิษฐา รัตตนงพิสัตย์"
];

const DEPARTMENTS = [
  "งานอำนวยการและสนับสนุนการบริหาร",
  "งานบริหาร",
  "งานบริหารเทคโนโลยีสารสนเทศและนวัตกรรม",
  "งานคลัง",
  "งานพัสดุ",
  "งานทรัพยากรบุคคล",
  "งานบริการการศึกษา",
  "งานกิจการนิสิต",
  "งานวิจัย",
  "งานพัฒนาคุณภาพบริการ",
  "ภาควิชากุมารเวชศาสตร์",
  "ภาควิชาจักษุวิทยา",
  "ภาควิชาจิตเวชศาสตร์",
  "ภาควิชาพยาธิวิทยา",
  "ภาควิชารังสีวิทยา",
  "ภาควิชาวิสัญญีวิทยา",
  "ภาควิชาเวชศาสตร์ชุมชน",
  "ภาควิชาศัลยศาสตร์",
  "ภาควิชาสูติศาสตร์-นรีเวชวิทยา",
  "ภาควิชาออร์โธปิดิกส์",
  "ภาควิชาอายุรศาสตร์",
  "ภาควิชาเวชศาสตร์ฟื้นฟู",
  "ภาควิชาโสต ศอ นาสิกวิทยา",
  "ภาควิชานิติเวชศาสตร์",
  "ภาควิชาเวชศาสตร์ครอบครัว",
  "ศูนย์พัฒนลักษณ์",
  "งานเลขานุการโรงพยาบาล",
  "งานคลินิกพิเศษนอกเวลาราชการ",
  "งานเครื่องมือแพทย์",
  "ศูนย์โรคหัวใจ",
  "ศูนย์วิจัยโลหิตวิทยา",
  "ศูนย์มะเร็ง",
  "ศูนย์ปลูกถ่ายกระจกตาและผ่าตัดแก้ไขสายตา",
  "ศูนย์โรคไต",
  "ศูนย์รักษาผู้มีบุตรยาก",
  "งานโภชนาการ",
  "งานกายภาพบำบัด กิจกรรมบำบัดและกายอุปกรณ์",
  "งานรังสีวิทยา",
  "งานนิติเวชศาสตร์",
  "งานจิตเวช",
  "งานสนับสนุนการแพทย์เฉพาะทาง",
  "งานบริหารเวชภัณฑ์ยา",
  "งานผลิตยา",
  "งานบริการและบริบาลผู้ป่วยนอก",
  "งานบริการและบริบาลผู้ป่วยใน",
  "งานเภสัชสนเทศและคุณภาพระบบยา",
  "งานประกันสุขภาพ",
  "งานคุณภาพเวชระเบียน",
  "งานบริหารการรับผู้ป่วยในและทรัพยากรสุขภาพ",
  "งานการพยาบาลผู้ป่วยนอก",
  "หน่วยผู้ป่วยนอก 1",
  "หน่วยผู้ป่วยนอก 2",
  "หน่วยบำบัดระยะสั้น",
  "หน่วยไตเทียม",
  "หน่วยอุบัติเหตุ-ฉุกเฉิน",
  "งานการพยาบาลผ่าตัดและวิสัญญี",
  "หน่วยผ่าตัด",
  "หน่วยการพยาบาลวิสัญญี",
  "งานการพยาบาลศัลยกรรม",
  "หอผู้ป่วยศัลยกรรม 1",
  "หอผู้ป่วยศัลยกรรม 2",
  "หอผู้ป่วยพิเศษศัลยกรรม",
  "หอผู้ป่วยจักษุ",
  "หอผู้ป่วยโสต ศอ นาสิก",
  "หอผู้ป่วยศัลยกรรมกระดูกและข้อ",
  "หอผู้ป่วยพิเศษศัลยกรรมกระดูกและข้อ",
  "งานการพยาบาลอายุรกรรม",
  "หอผู้ป่วยโรคหัวใจ",
  "หอผู้ป่วยอายุรกรรม 1",
  "หอผู้ป่วยอายุรกรรม 2",
  "หอผู้ป่วยพิเศษอายุรกรรม",
  "หอผู้ป่วยพิเศษทั่วไป 1",
  "หอผู้ป่วยพิเศษทั่วไป 2",
  "หน่วยปฏิบัติการตรวจสวนหัวใจและหลอดเลือด",
  "งานการพยาบาลสูติ-นรีเวชกรรม",
  "หน่วยห้องคลอด",
  "หอผู้ป่วยสูติ-นรีเวชกรรม",
  "หอผู้ป่วยพิเศษสูติ-นรีเวชกรรม",
  "งานการพยาบาลกุมารเวชกรรม",
  "หอผู้ป่วยกุมารเวชกรรม 1",
  "หอผู้ป่วยกุมารเวชกรรม 2",
  "หอผู้ป่วยกุมารเวชกรรม 3",
  "หอผู้ป่วยวิกฤตทารกแรกเกิด",
  "หอผู้ป่วยวิกฤตกุมารเวชกรรม",
  "งานสนับสนุนการพยาบาล",
  "หน่วยป้องกันและควบคุมการติดเชื้อ",
  "หน่วยเวชภัณฑ์ปลอดเชื้อกลาง",
  "งานการพยาบาลเวชศาสตร์ป้องกัน",
  "หน่วยสร้างเสริมสุขภาพและควบคุมโรค",
  "หน่วยอาชีวอนามัย",
  "งานการพยาบาลวิกฤต",
  "หอผู้ป่วยวิกฤตศัลยกรรมหัวใจและทรวงอก",
  "หอผู้ป่วยวิกฤตศัลยกรรมทั่วไป 1",
  "หอผู้ป่วยวิกฤตศัลยกรรมทั่วไป 2",
  "หอผู้ป่วยวิกฤตอายุรกรรม",
  "หอผู้ป่วยวิกฤตหัวใจและหลอดเลือด",
  "หอผู้ป่วยวิกฤตระบบทางเดินหายใจ",
  "งานห้องปฏิบัติการกลาง",
  "งานชันสูตรโรคติดเชื้อ",
  "งานธนาคารเลือด",
  "งานพยาธิวิทยากายวิภาค"
];

const formatThaiDate = (date: Date) => {
  if (!isValid(date)) return "-";
  const day = format(date, "d", { locale: th });
  const month = format(date, "MMMM", { locale: th });
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

const formatDate = (dateStr: string) => {
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

const calculateProbationEnd = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = parseISO(dateStr);
  if (!isValid(date)) return "-";
  
  const startDate = date;
  const endDate = new Date(date);
  endDate.setMonth(endDate.getMonth() + 6);
  endDate.setDate(endDate.getDate() - 1);
  
  return `${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate)}`;
};

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
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
  const [view, setView] = useState<"tracking" | "dashboard">("dashboard");

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
        setUser(data.user);
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
      setUser(null);
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("user");
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
        department: record.department,
        department_unit: record.department_unit || "",
        employment_type: record.employment_type,
        round1_status: record.round1_status,
        round1_start_date: record.round1_start_date,
        round1_end_date: record.round1_end_date,
        round2_status: record.round2_status,
        round2_start_date: record.round2_start_date,
        round2_end_date: record.round2_end_date,
        chairman: record.chairman,
        committee1: record.committee1,
        committee2: record.committee2,
        committee3: record.committee3,
        committee4: record.committee4,
        secretary: record.secretary,
        round1_score: record.round1_score || "",
        round2_score: record.round2_score || ""
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

  const handleClearAll = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้ และจะล้างข้อมูลใน Google Sheet ด้วย")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/clear-all", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        alert("ลบข้อมูลทั้งหมดเรียบร้อยแล้ว และรีเซ็ตลำดับ ID เริ่มต้นที่ 1");
        fetchRecords();
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to clear all records:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      if (roundFilter === "all") return true;
      if (roundFilter === "round1") return r.round1_status === "รอดำเนินการ";
      if (roundFilter === "round1_done") return r.round1_status !== "รอดำเนินการ";
      if (roundFilter === "round2") return r.round2_status === "รอดำเนินการ";
      if (roundFilter === "round2_done") return r.round2_status !== "รอดำเนินการ";
      if (roundFilter === "completed") return r.round1_status !== "รอดำเนินการ" && r.round2_status !== "รอดำเนินการ";
      
      return true;
    });
  }, [records, searchTerm, roundFilter]);

  const notifications = useMemo(() => {
    const today = new Date();
    const list: { id: string, title: string, description: string, date: string, type: 'warning' | 'info' }[] = [];

    records.forEach(record => {
      // Check Round 1
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

      // Check Round 2
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

    return list.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [records]);

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

  const handleExportSummary = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
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
      pdf.save(`สรุปผลการทดลองงาน-${format(new Date(), "yyyyMMdd")}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setIsExporting(false);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
            <p className="text-gray-500 text-sm mt-1">ระบบติดตามผลการทดลองงาน</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">ชื่อผู้ใช้</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="กรอกชื่อผู้ใช้..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">รหัสผ่าน</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="กรอกรหัสผ่าน..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              เข้าสู่ระบบ
            </button>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}
          </form>

          <p className="text-center text-gray-400 text-[10px] mt-8 uppercase tracking-widest font-bold">
            Authorized Personnel Only
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Header */}
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
                <option value="round1_done">รอบที่ 1 (ดำเนินการแล้ว)</option>
                <option value="round2">รอบที่ 2 (รอดำเนินการ)</option>
                <option value="round2_done">รอบที่ 2 (ดำเนินการแล้ว)</option>
                <option value="completed">ประเมินครบแล้ว</option>
              </select>
            </div>
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
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                              <Bell size={24} />
                            </div>
                            <p className="text-sm text-[#6B7280]">ไม่มีการแจ้งเตือนใหม่</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#F3F4F6]">
                            {notifications.map(notif => (
                              <div key={notif.id} className="p-4 hover:bg-[#F9FAFB] transition-colors flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                  notif.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                                )}>
                                  {notif.type === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-xs font-bold text-[#111827] leading-tight">{notif.title}</p>
                                  <p className="text-[11px] text-[#6B7280]">{notif.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleExportSummary}
              disabled={isExporting || records.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
              title="ส่งออกสรุป PDF"
            >
              <FileText size={18} className={cn(isExporting && "animate-pulse")} />
              <span className="hidden sm:inline">สรุป PDF</span>
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>เพิ่มข้อมูล</span>
            </button>
            <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-8 h-8 rounded-lg shadow-sm" />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <User size={18} />
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-bold text-gray-900 truncate max-w-[100px]">{user.displayName || "User"}</span>
                <span className="text-[8px] text-gray-500 uppercase tracking-tighter">{isAdmin ? "Admin" : "User"}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Second Row for Sheet Actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Sheet Actions:</span>
          <button 
            onClick={handleSyncAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>ส่งข้อมูลไป Sheet</span>
          </button>
          <button 
            onClick={handleSyncFromSheet}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50"
          >
            <Download size={14} className={isLoading ? "animate-spin" : ""} />
            <span>ดึงข้อมูลจาก Sheet</span>
          </button>
          {isAdmin && (
            <button 
              onClick={handleClearAll}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>ล้างข้อมูลทั้งหมด</span>
            </button>
          )}
          <a 
            href={`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID || '1KWi5xixRRLFh0GmKLvoq0V5aGYVJRqv5ZxrMJllMwds'}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
          >
            <ExternalLink size={14} />
            <span>เปิด Google Sheet</span>
          </a>
          {process.env.VITE_GOOGLE_WEB_APP_URL && (
            <a 
              href={process.env.VITE_GOOGLE_WEB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
            >
              <Share2 size={14} />
              <span>Web App</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "dashboard" ? (
          <Dashboard records={records} />
        ) : (
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
                    <td colSpan={8} className="p-12 text-center text-[#9CA3AF] text-sm italic">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#9CA3AF] text-sm italic">ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors group">
                      <td className="p-4 text-sm font-mono text-[#6B7280]">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[#111827]">{record.title}{record.first_name} {record.last_name}</span>
                          <span className="text-[10px] text-[#6B7280] font-medium">{record.employment_type}</span>
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
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                      <label className="text-xs font-bold text-[#374151] uppercase">สังกัดหน่วย</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.department_unit}
                        onChange={e => setFormData({...formData, department_unit: e.target.value})}
                        placeholder="ระบุสังกัดหน่วย (ถ้ามี)"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#374151] uppercase">ประเภทการจ้าง</label>
                      <select 
                        required
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.employment_type}
                        onChange={e => setFormData({...formData, employment_type: e.target.value})}
                      >
                        <option value="">เลือกประเภทการจ้าง...</option>
                        {EMPLOYMENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
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
                          <option>ดำเนินการแล้ว</option>
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
                          <option>ดำเนินการแล้ว</option>
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
        )}
      </AnimatePresence>

      {/* Hidden Export Templates */}
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
                  <p><strong>ประเภทการจ้าง:</strong> {exportData.employment_type || "-"}</p>
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
    </div>
  );
}

function Dashboard({ records }: { records: AppRecord[] }) {
  const stats = useMemo(() => {
    const total = records.length;
    const stats_pending = records.filter(r => r.round1_status === "รอดำเนินการ").length;
    const stats_in_progress = records.filter(r => 
      (r.round1_status !== "รอดำเนินการ" && r.round2_status === "รอดำเนินการ") ||
      (["ดำเนินการแล้ว", "ส่งหน้างานแล้ว", "ส่งมหาลัยแล้ว"].includes(r.round2_status))
    ).length;
    const stats_passed = records.filter(r => r.round2_status === "ผ่านการประเมิน").length;
    const stats_failed = records.filter(r => r.round2_status === "ไม่ผ่านการประเมิน").length;

    const today = new Date();
    const overdueRecords = records.filter(r => {
      const r1Overdue = r.round1_status === "รอดำเนินการ" && r.round1_end_date && parseISO(r.round1_end_date) < today;
      const r2Overdue = r.round2_status === "รอดำเนินการ" && r.round2_end_date && parseISO(r.round2_end_date) < today;
      return r1Overdue || r2Overdue;
    });
    const overdue = overdueRecords.length;

    // Status Chart Data
    const statusData = [
      { name: "ผ่านการประเมิน", value: stats_passed, color: "#10B981" },
      { name: "กำลังดำเนินการ", value: stats_in_progress, color: "#06B6D4" },
      { name: "รอดำเนินการ", value: stats_pending, color: "#6B7280" },
      { name: "ไม่ผ่าน", value: stats_failed, color: "#EF4444" },
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

    return { 
      total, 
      passed: stats_passed, 
      inProgress: stats_in_progress, 
      pending: stats_pending, 
      failed: stats_failed, 
      overdue, 
      overdueRecords, 
      statusData, 
      deptData 
    };
  }, [records]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
          title="กำลังดำเนินการ" 
          value={stats.inProgress} 
          icon={<Clock size={20} />} 
          color="bg-cyan-500" 
        />
        <StatCard 
          title="รอดำเนินการ" 
          value={stats.pending} 
          icon={<AlertTriangle size={20} />} 
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
        {/* Charts Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            สรุปสถานะการประเมิน
          </h3>
          <div className="h-[300px] w-full">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            จำนวนพนักงานแยกตามสังกัด (Top 8)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.deptData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

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
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
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
}

function StatusBadge({ status, startDate, endDate, score }: { status: string, startDate: string, endDate: string, score?: string }) {
  const isDone = status === "ผ่านการประเมิน" || status === "ส่งหน้างานแล้ว";
  const isFailed = status === "ไม่ผ่านการประเมิน";
  
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
        status === "ดำเนินการแล้ว" && "bg-cyan-50 text-cyan-600 border border-cyan-100",
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
          {endDate && <span>ถึง: {formatDateLocal(endDate)}</span>}
        </div>
      )}
    </div>
  );
}
