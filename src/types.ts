export interface Appointment {
  id: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  issue: string;
  appointment_date: string;
  job_id?: string;
}

export interface RepairStatus {
  job_id: string;
  customer_name: string;
  status: 'Pending' | 'In Progress' | 'Ready for Pickup' | 'Delivered';
}

export interface Feedback {
  id: string;
  rating: number;
  comments: string;
  date: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isSpeech?: boolean;
}

export interface DashboardStats {
  totalAppointments: number;
  activeRepairs: number;
  totalFeedback: number;
  averageRating: number;
}
