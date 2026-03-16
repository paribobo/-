import { format, parseISO, isValid } from "date-fns";
import { th } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatThaiDate = (date: Date) => {
  if (!isValid(date)) return "-";
  const day = format(date, "d", { locale: th });
  const month = format(date, "MMMM", { locale: th });
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
};

export const formatDate = (dateStr: string) => {
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

export const calculateProbationEnd = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = parseISO(dateStr);
  if (!isValid(date)) return "-";
  
  const startDate = date;
  const endDate = new Date(date);
  endDate.setMonth(endDate.getMonth() + 6);
  endDate.setDate(endDate.getDate() - 1);
  
  return `${formatThaiDate(startDate)} ถึงวันที่ ${formatThaiDate(endDate)}`;
};
