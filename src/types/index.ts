export type Status = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type Role = 'admin' | 'sales';
export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: Status;
  assigned_to: string | null;
  created_at: string;
  company?: string;
}

export interface Deal {
  id: string;
  lead_id: string;
  title: string;
  value: number;
  stage: 'New' | 'In Progress' | 'Won' | 'Lost';
  assigned_to: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id: string;
  description: string;
  due_date: string;
  status: 'Pending' | 'Done';
  created_at: string;
  title: string;
}

export interface User extends Profile {
  email: string;
}
