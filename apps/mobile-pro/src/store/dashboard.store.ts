/**
 * Dashboard Store — VitaCare Pro
 */

import { create } from 'zustand';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardOverview } from '../types/api-responses';

interface DashboardState {
  data:       DashboardOverview | null;
  isLoading:  boolean;
  error:      string | null;
  fetchOverview: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data:      null,
  isLoading: false,
  error:     null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardService.getOverview();
      set({ data, isLoading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'Erreur lors du chargement', isLoading: false });
    }
  },
}));
