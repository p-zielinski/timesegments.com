import { create } from 'zustand';
import { Category, Note, TimeLog, User } from '@prisma/client';
import { ControlValue, Limits, TimePeriod } from '@test1/shared';

export interface Store {
  user: User;
  setUser: (user: User) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  timeLogs: TimeLog[];
  setTimeLogs: (timeLogs: TimeLog[]) => void;
  fetchedPeriods: TimePeriod[];
  setFetchedPeriods: (fetchedPeriods: TimePeriod[]) => void;
  limits: Limits;
  setLimits: (limits: Limits) => void;
  controlValues: Record<ControlValue, string>;
  setControlValues: (controlValues: Record<ControlValue, string>) => void;
}

export const useStore = create<Store>()((set) => ({
  user: undefined,
  setUser: (user) => set((state) => ({ ...state, user })),
  categories: [],
  setCategories: (categories) => set((state) => ({ ...state, categories })),
  notes: [],
  setNotes: (notes) => set((state) => ({ ...state, notes })),
  timeLogs: [],
  setTimeLogs: (timeLogs) => set((state) => ({ ...state, timeLogs })),
  fetchedPeriods: [],
  setFetchedPeriods: (fetchedPeriods) =>
    set((state) => ({ ...state, fetchedPeriods })),
  limits: undefined,
  setLimits: (limits) => set((state) => ({ ...state, limits })),
  controlValues: undefined,
  setControlValues: (controlValues) =>
    set((state) => ({ ...state, controlValues })),
}));
