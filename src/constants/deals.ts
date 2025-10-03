/**
 * Deal-related constants and types
 */

import type { Deal } from '../types';

export const DEAL_STAGES = ['New', 'In Progress', 'Won', 'Lost'] as const;

export type DealStage = typeof DEAL_STAGES[number];

export interface DealWithDetails extends Deal {
    lead?: { name: string };
    assigneeName?: string;
}
