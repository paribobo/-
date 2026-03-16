export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'info' | 'warning';
}

export interface AppRecord {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  appointment_date: string;
  position: string;
  department: string;
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
  created_at: string;
}

export type ViewType = "tracking" | "dashboard";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'warning' | 'info';
}
