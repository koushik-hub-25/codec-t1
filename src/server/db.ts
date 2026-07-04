import fs from 'fs';
import path from 'path';

// Define DB paths
const DATA_DIR = path.join(process.cwd(), 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const REPAIR_STATUS_FILE = path.join(DATA_DIR, 'repair_status.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  issue: string;
  appointment_date: string;
}

export interface RepairStatus {
  job_id: string;
  customer_name: string;
  status: 'Pending' | 'In Progress' | 'Ready for Pickup' | 'Delivered';
}

export interface Feedback {
  id: string;
  rating: number; // 1 to 5
  comments: string;
  date: string;
}

// Read helper
function readFile<T>(filePath: string, defaultData: T[]): T[] {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Write helper
function writeFile<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize and Seed Default Statuses
const initialRepairStatuses: RepairStatus[] = [
  { job_id: 'JOB101', customer_name: 'Koushik Narayanasamy', status: 'Ready for Pickup' },
  { job_id: 'JOB102', customer_name: 'Amit Sharma', status: 'In Progress' },
  { job_id: 'JOB103', customer_name: 'Sarah Connor', status: 'Delivered' },
  { job_id: 'JOB104', customer_name: 'John Doe', status: 'Pending' }
];

export const db = {
  // Appointments methods
  getAppointments(): Appointment[] {
    return readFile<Appointment>(APPOINTMENTS_FILE, []);
  },

  addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
    const appointments = this.getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: `APT${1000 + appointments.length + 1}`
    };
    appointments.push(newAppointment);
    writeFile(APPOINTMENTS_FILE, appointments);
    return newAppointment;
  },

  // Repair Status methods
  getRepairStatuses(): RepairStatus[] {
    return readFile<RepairStatus>(REPAIR_STATUS_FILE, initialRepairStatuses);
  },

  getRepairStatus(job_id: string): RepairStatus | undefined {
    const statuses = this.getRepairStatuses();
    return statuses.find(s => s.job_id.toUpperCase() === job_id.toUpperCase());
  },

  addRepairStatus(status: RepairStatus): void {
    const statuses = this.getRepairStatuses();
    const existingIndex = statuses.findIndex(s => s.job_id.toUpperCase() === status.job_id.toUpperCase());
    if (existingIndex !== -1) {
      statuses[existingIndex] = status;
    } else {
      statuses.push(status);
    }
    writeFile(REPAIR_STATUS_FILE, statuses);
  },

  updateRepairStatus(job_id: string, newStatus: RepairStatus['status']): RepairStatus | undefined {
    const statuses = this.getRepairStatuses();
    const index = statuses.findIndex(s => s.job_id.toUpperCase() === job_id.toUpperCase());
    if (index !== -1) {
      statuses[index].status = newStatus;
      writeFile(REPAIR_STATUS_FILE, statuses);
      return statuses[index];
    }
    return undefined;
  },

  // Feedback methods
  getFeedback(): Feedback[] {
    return readFile<Feedback>(FEEDBACK_FILE, []);
  },

  addFeedback(rating: number, comments: string): Feedback {
    const feedbacks = this.getFeedback();
    const newFeedback: Feedback = {
      id: `FDB${100 + feedbacks.length + 1}`,
      rating,
      comments,
      date: new Date().toISOString().split('T')[0]
    };
    feedbacks.push(newFeedback);
    writeFile(FEEDBACK_FILE, feedbacks);
    return newFeedback;
  }
};

// Auto seed on import
db.getRepairStatuses();
