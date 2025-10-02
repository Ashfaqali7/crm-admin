import type { Task } from '../types';
import { BaseService } from './baseService';
import { supabase } from './supabaseClient';

export class TasksService extends BaseService<Task> {
  constructor() {
    super('tasks');
  }

  async getByStatus(status: Task['status']): Promise<Task[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWithLead(): Promise<(Task & { lead: { name: string } })[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        lead:leads(name)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const tasksService = new TasksService();