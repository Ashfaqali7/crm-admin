import type { Deal } from '../types';
import { BaseService } from './baseService';
import { supabase } from './supabaseClient';

export class DealsService extends BaseService<Deal> {
  constructor() {
    super('deals');
  }

  async getByStage(stage: Deal['stage']): Promise<Deal[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWithDetails(): Promise<(Deal & { lead: { name: string }, assignee: { full_name: string } | null })[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        lead:leads(name),
        assignee:profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDealsByValue(): Promise<{ stage: string; totalValue: number }[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('stage, value');

    if (error) throw error;

    return (data || []).reduce((acc: { stage: string; totalValue: number }[], deal) => {
      const stageIndex = acc.findIndex(item => item.stage === deal.stage);
      if (stageIndex === -1) {
        acc.push({ stage: deal.stage, totalValue: deal.value || 0 });
      } else {
        acc[stageIndex].totalValue += deal.value || 0;
      }
      return acc;
    }, []);
  }
}

export const dealsService = new DealsService();