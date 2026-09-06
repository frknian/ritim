import { create } from 'zustand';
import { AreaWithStats, Area } from '../types';
import { AreaRepository } from '../db/repositories/areaRepository';
import { haptic } from '../utils/haptics';

interface AreaState {
  areas: AreaWithStats[];
  loading: boolean;

  loadAreas: () => void;
  createArea: (area: Omit<Area, 'createdAt' | 'updatedAt'>) => void;
  updateArea: (area: Partial<Area> & { id: string }) => void;
  deleteArea: (id: string) => void;
}

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],
  loading: false,

  loadAreas: () => {
    try {
      const data = AreaRepository.getAllWithStats();
      set({ areas: data });
    } catch (error) {
      console.error('Alanlar yüklenemedi:', error);
    }
  },

  createArea: (area) => {
    try {
      haptic.success();
      AreaRepository.create(area);
      get().loadAreas();
    } catch (error) {
      console.error('Alan oluşturulamadı:', error);
    }
  },

  updateArea: (area) => {
    try {
      haptic.light();
      AreaRepository.update(area);
      get().loadAreas();
    } catch (error) {
      console.error('Alan güncellenemedi:', error);
    }
  },

  deleteArea: (id) => {
    try {
      haptic.warning();
      AreaRepository.delete(id);
      get().loadAreas();
    } catch (error) {
      console.error('Alan silinemedi:', error);
    }
  },
}));
