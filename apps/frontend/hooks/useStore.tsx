import { create } from 'zustand';
import { Category, Note, TimeLog, User } from '@prisma/client';
import { ControlValue, Limits, TimePeriod } from '@test1/shared';
import { handleFetch } from '../utils/fetchingData/handleFetch';
import JsCookies from 'js-cookie';
import { router } from 'next/client';

export interface StoreProps {
  isEditing: Record<string, any>;
  isSaving: boolean;
  user: User;
  categories: Category[];
  notes: Note[];
  timeLogs: TimeLog[];
  fetchedPeriods: TimePeriod[];
  limits: Limits;
  controlValues: Record<ControlValue, string>;
}

export interface State extends StoreProps {
  setIsEditing: (isEditing: Record<string, any>) => void;
  setIsSaving: (isSaving: boolean) => void;
  setUser: (user: User) => void;
  setCategories: (categories: Category[]) => void;
  setNotes: (notes: Note[]) => void;
  setTimeLogs: (timeLogs: TimeLog[]) => void;
  setFetchedPeriods: (fetchedPeriods: TimePeriod[]) => void;
  setLimits: (limits: Limits) => void;
  setControlValues: (controlValues: Record<ControlValue, string>) => void;
  handleIncorrectControlValues: (
    typesOfControlValuesWithIncorrectValues: ControlValue[]
  ) => void;
}

export const createStore = (initProps?: Partial<StoreProps>) => {
  const DEFAULT_PROPS: StoreProps = {
    isEditing: undefined,
    isSaving: false,
    user: undefined,
    categories: [],
    notes: [],
    timeLogs: [],
    fetchedPeriods: [],
    limits: undefined,
    controlValues: undefined,
  };
  return create<State>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setIsEditing: (isEditing) => set((state) => ({ ...state, isEditing })),
    setIsSaving: (isSaving) => set((state) => ({ ...state, isSaving })),
    setUser: (user) => set((state) => ({ ...state, user })),
    setCategories: (categories) => set((state) => ({ ...state, categories })),
    setNotes: (notes) => set((state) => ({ ...state, notes })),
    setTimeLogs: (timeLogs) => set((state) => ({ ...state, timeLogs })),
    setFetchedPeriods: (fetchedPeriods) =>
      set((state) => ({ ...state, fetchedPeriods })),
    setLimits: (limits) => set((state) => ({ ...state, limits })),
    setControlValues: (controlValues) =>
      set((state) => ({ ...state, controlValues })),
    handleIncorrectControlValues: async (
      typesOfControlValuesWithIncorrectValues: ControlValue[]
    ) => {
      try {
        const response = await handleFetch({
          pathOrUrl: 'user/me-extended',
          body: { extend: [] },
          method: 'POST',
        });
        console.log(typesOfControlValuesWithIncorrectValues);
      } catch (e) {
        console.log(e);
        JsCookies.remove('jwt_token');
        return await router.push('/');
      }
    },
  }));
};
