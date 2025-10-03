import { useState, useCallback, useEffect } from 'react';
import { dealsService } from '../services/dealsService';
import { leadsService } from '../services/leadsService';
import { useTheme } from '../context/ThemeContext';
import type { Deal, Lead } from '../types';

export const useDealsData = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dealsService.getWithDetails();
            setDeals(data);
        } catch (error) {
            const errorMessage = 'Failed to fetch deals. Please try again.';
            setError(errorMessage);
            theme.showBanner(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [theme]);

    const fetchLeads = useCallback(async () => {
        try {
            const data = await leadsService.getAll();
            setLeads(data);
        } catch (error) {
            const errorMessage = 'Failed to fetch leads. Please try again.';
            setError(errorMessage);
            theme.showBanner(errorMessage, 'error');
        }
    }, [theme]);

    const updateDeal = useCallback(async (dealId: string, updates: Partial<Deal>) => {
        setLoading(true);
        try {
            await dealsService.update(dealId, updates);
            await fetchDeals();
            theme.showBanner('Deal updated successfully', 'success');
            return true;
        } catch (error) {
            theme.showBanner('Failed to update deal. Please try again.', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchDeals, theme]);

    const createDeal = useCallback(async (dealData: Partial<Deal>) => {
        setLoading(true);
        try {
            await dealsService.create(dealData);
            await fetchDeals();
            theme.showBanner('Deal created successfully', 'success');
            return true;
        } catch (error) {
            theme.showBanner('Failed to create deal. Please try again.', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchDeals, theme]);

    useEffect(() => {
        fetchDeals();
        fetchLeads();
    }, [fetchDeals, fetchLeads]);

    return {
        deals,
        leads,
        loading,
        error,
        setError,
        fetchDeals,
        updateDeal,
        createDeal,
    };
};
