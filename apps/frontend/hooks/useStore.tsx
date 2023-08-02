import { create } from 'zustand';
import { Category, Note, TimeLog, User } from '@prisma/client';
import { ControlValue, Limits, TimePeriod } from '@test1/shared';

interface StoreProps {
  user: User;
  categories: Category[];
  notes: Note[];
  timeLogs: TimeLog[];
  fetchedPeriods: TimePeriod[];
  limits: Limits;
  controlValues: Record<ControlValue, string>;
}

interface BearState extends StoreProps {
  setUser: (user: User) => void;
  setCategories: (categories: Category[]) => void;
  setNotes: (notes: Note[]) => void;
  setTimeLogs: (timeLogs: TimeLog[]) => void;
  setFetchedPeriods: (fetchedPeriods: TimePeriod[]) => void;
  setLimits: (limits: Limits) => void;
  setControlValues: (controlValues: Record<ControlValue, string>) => void;
}

export const createStore = (initProps?: Partial<StoreProps>) => {
  const DEFAULT_PROPS: StoreProps = {
    user: undefined,
    categories: undefined,
    notes: undefined,
    timeLogs: undefined,
    fetchedPeriods: undefined,
    limits: undefined,
    controlValues: undefined,
  };
  return create<BearState>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setUser: (user) => set((state) => ({ ...state, user })),
    setCategories: (categories) => set((state) => ({ ...state, categories })),
    setNotes: (notes) => set((state) => ({ ...state, notes })),
    setTimeLogs: (timeLogs) => set((state) => ({ ...state, timeLogs })),
    setFetchedPeriods: (fetchedPeriods) =>
      set((state) => ({ ...state, fetchedPeriods })),
    setLimits: (limits) => set((state) => ({ ...state, limits })),
    setControlValues: (controlValues) =>
      set((state) => ({ ...state, controlValues })),
  }));
};
