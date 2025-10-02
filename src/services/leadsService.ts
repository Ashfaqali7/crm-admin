import type { Lead } from '../types';
import { BaseService } from './baseService';
import { supabase } from './supabaseClient';

export class LeadsService extends BaseService<Lead> {
  constructor() {
    super('leads');
  }

  async getByStatus(status: Lead['status']): Promise<Lead[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWithAssignee(): Promise<(Lead & { assignee: { full_name: string } | null })[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        assignee:profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const leadsService = new LeadsService();