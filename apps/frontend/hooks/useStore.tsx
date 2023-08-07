import { create } from 'zustand';
import { Category, Note, TimeLog, User } from '@prisma/client';
import { ControlValue, Limits } from '@test1/shared';
import { handleFetch } from '../utils/fetchingData/handleFetch';
import JsCookies from 'js-cookie';
import { NextRouter } from 'next/router';
import { createContext } from 'react';

export const StoreContext = createContext<Store | null>(null);
type Store = ReturnType<typeof createStore>;

export interface StoreProps {
  key: string;
  groupedTimeLogPeriods: Record<string, number>;
  disableHover: boolean;
  router: NextRouter;
  isEditing: Record<string, any>;
  isSaving: boolean;
  user: User;
  categories: Category[];
  notes: Note[];
  timeLogs: TimeLog[];
  fetchedFrom: number;
  limits: Limits;
  controlValues: Record<ControlValue, string>;
}

export interface State extends StoreProps {
  setKey: (key: string) => void;
  setGroupedTimeLogPeriods: (
    groupedTimeLogPeriods: Record<string, number>
  ) => void;
  getGroupedTimeLogPeriod: (timeLogId: string) => number;
  setIsEditing: (isEditing: Record<string, any>) => void;
  setIsSaving: (isSaving: boolean) => void;
  setUser: (user: User) => void;
  setCategories: (categories: Category[]) => void;
  setNotes: (notes: Note[]) => void;
  setTimeLogs: (timeLogs: TimeLog[]) => void;
  setFetchedFrom: (fetchedFrom: number) => void;
  setLimits: (limits: Limits) => void;
  setPartialControlValues: (
    partialControlValues: Record<ControlValue, string>
  ) => void;
  setControlValues: (controlValues: Record<ControlValue, string>) => void;
  handleIncorrectControlValues: (
    typesOfControlValuesWithIncorrectValues: ControlValue[]
  ) => void;
}

export const createStore = (initProps?: Partial<StoreProps>) => {
  const DEFAULT_PROPS: StoreProps = {
    key: 'undefined',
    groupedTimeLogPeriods: {},
    disableHover: false,
    router: undefined,
    isEditing: {},
    isSaving: false,
    user: undefined,
    categories: [],
    notes: [],
    timeLogs: [],
    fetchedFrom: undefined,
    limits: undefined,
    controlValues: undefined,
  };
  if (!initProps.router) {
    throw 'Router was not initialized';
  }
  if (typeof initProps.disableHover === 'undefined') {
    throw 'DisableHover was not set';
  }
  return create<State>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setKey: (key) => set(() => ({ key })),
    setGroupedTimeLogPeriods: (groupedTimeLogPeriods) =>
      set(() => ({ groupedTimeLogPeriods })),
    getGroupedTimeLogPeriod: (categoryId) =>
      get().groupedTimeLogPeriods?.[categoryId] || 0,
    setIsEditing: (isEditing) => set(() => ({ isEditing })),
    setIsSaving: (isSaving) => set(() => ({ isSaving })),
    setUser: (user) => set(() => ({ user })),
    setCategories: (categories) => set((state) => ({ categories })),
    setNotes: (notes) => set(() => ({ notes })),
    setTimeLogs: (timeLogs) => set(() => ({ timeLogs })),
    setFetchedFrom: (fetchedFrom) => set(() => ({ fetchedFrom })),
    setLimits: (limits) => set(() => ({ limits })),
    setControlValues: (controlValues) => set(() => ({ controlValues })),
    setPartialControlValues: (controlValues) =>
      set((state) => ({
        controlValues: { ...state.controlValues, ...controlValues },
      })),
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
        const { router } = get();
        return await router.push('/');
      }
    },
  }));
};
