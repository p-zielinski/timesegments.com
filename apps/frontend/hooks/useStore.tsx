import { create } from 'zustand';
import { Category, Note, TimeLog, User } from '@prisma/client';
import {
  ControlValue,
  Limits,
  MeExtendedOption,
  TimePeriod,
  Timezones,
} from '@test1/shared';
import { handleFetch } from '../utils/fetchingData/handleFetch';
import JsCookies from 'js-cookie';
import { NextRouter } from 'next/router';
import { createContext } from 'react';
import { DateTime } from 'luxon';
import { StatusCodes } from 'http-status-codes';
import { isObject, uniqBy } from 'lodash';

export const StoreContext = createContext<Store | null>(null);
type Store = ReturnType<typeof createStore>;

export interface StoreProps {
  fetchedPeriods: TimePeriod[];
  currentTokenId: string;
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
  showTimeLogsFrom: number;
  showTimeLogsTo: number;
}

export interface State extends StoreProps {
  addNote: (note: Note) => void;
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
  checkControlValues: () => void;
  setShowTimeLogsFrom: (showTimeLogsFrom: number) => void;
  setShowTimeLogsTo: (showTimeLogsTo: number) => void;
}

export const createStore = (initProps?: Partial<StoreProps>) => {
  const DEFAULT_PROPS: StoreProps = {
    fetchedPeriods: [],
    currentTokenId: undefined,
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
    showTimeLogsFrom: undefined,
    showTimeLogsTo: undefined,
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
    addNote: (note) => set(() => ({ notes: [...get().notes, note] })),
    setIsEditing: (isEditing) => set(() => ({ isEditing })),
    setIsSaving: (isSaving) => set(() => ({ isSaving })),
    setUser: (user) => set(() => ({ user })),
    setCategories: (categories) => set(() => ({ categories })),
    setNotes: (notes) => set(() => ({ notes: uniqBy(notes, 'id') })),
    setTimeLogs: (timeLogs) =>
      set(() => ({ timeLogs: uniqBy(timeLogs, 'id') })),
    setFetchedFrom: (fetchedFrom) => set(() => ({ fetchedFrom })),
    setLimits: (limits) => set(() => ({ limits })),
    setControlValues: (controlValues) => set(() => ({ controlValues })),
    setPartialControlValues: (controlValues) =>
      set((state) => ({
        controlValues: { ...state.controlValues, ...controlValues },
      })),
    setShowTimeLogsFrom: (showTimeLogsFrom) =>
      set(() => ({ showTimeLogsFrom })),
    setShowTimeLogsTo: (showTimeLogsTo) => set(() => ({ showTimeLogsTo })),
    handleIncorrectControlValues: async (
      typesOfControlValuesWithIncorrectValues: ControlValue[]
    ) => {
      const extend: MeExtendedOption[] = [];
      if (
        typesOfControlValuesWithIncorrectValues.includes(
          ControlValue.CATEGORIES
        )
      ) {
        extend.push(MeExtendedOption.CATEGORIES);
      }
      if (
        typesOfControlValuesWithIncorrectValues.includes(ControlValue.TIME_LOGS)
      ) {
        extend.push(MeExtendedOption.TODAYS_TIMELOGS);
      }
      if (
        typesOfControlValuesWithIncorrectValues.includes(ControlValue.NOTES)
      ) {
        extend.push(MeExtendedOption.CATEGORIES_NOTES);
      }
      try {
        const response = await handleFetch({
          pathOrUrl: 'user/me-extended',
          body: { extend },
          method: 'POST',
        });
        const {
          user,
          categories,
          notes,
          timeLogs,
          fetchedFrom,
          limits,
          controlValues,
        }: {
          user: User;
          categories?: Category[];
          notes?: Note[];
          timeLogs?: TimeLog[];
          fetchedFrom?: number;
          limits: Limits;
          controlValues: Record<ControlValue, string>;
        } = response;
        const storedUser = get().user;
        const storedFetchedFrom = get().fetchedFrom;
        const setState = {
          isSaving: false,
          user,
        };
        const overrideControlValues = {};
        if (
          storedUser.timezone !== user.timezone &&
          !extend.includes(MeExtendedOption.TODAYS_TIMELOGS)
        ) {
          const newDesiredFetchedFrom = DateTime.now()
            .setZone(Timezones[user.timezone])
            .set({ hour: 24, minute: 0, second: 0, millisecond: 0 })
            .minus({ days: 1 })
            .toMillis();
          if (newDesiredFetchedFrom < storedFetchedFrom) {
            const response = await handleFetch({
              pathOrUrl: 'time-log/find-extended',
              body: {
                from: newDesiredFetchedFrom,
                to: storedFetchedFrom,
                alreadyKnownCategories: get().categories.map(
                  (category) => category.id
                ),
              },
              method: 'POST',
            });
            if (response.partialControlValues?.[ControlValue.TIME_LOGS]) {
              overrideControlValues[ControlValue.TIME_LOGS] =
                response.partialControlValues[ControlValue.TIME_LOGS];
            }
            if (Array.isArray(response.timeLogs)) {
              const oldTimeLogs = get().timeLogs.filter(
                (timeLog) =>
                  !response.timeLogs
                    .map((timeLog) => timeLog.id)
                    .includes(timeLog.id)
              );
              setState['timeLogs'] = [...oldTimeLogs, ...response.timeLogs];
            }
          }
        }
        if (Array.isArray(categories)) {
          setState['categories'] = categories;
        }
        if (Array.isArray(notes)) {
          setState['notes'] = notes;
        }
        if (Array.isArray(timeLogs)) {
          setState['timeLogs'] = timeLogs;
        }
        if (Number.isInteger(fetchedFrom)) {
          setState['fetchedFrom'] = fetchedFrom;
        }
        if (limits instanceof Object) {
          setState['limits'] = limits;
        }
        setState['controlValues'] = {
          ...(get().controlValues || {}),
          ...(controlValues || {}),
          ...overrideControlValues,
        };
        return set(() => setState);
      } catch (e) {
        console.log(e);
        JsCookies.remove('jwt_token');
        const { router } = get();
        return await router.push('/');
      }
    },
    checkControlValues: async () => {
      const {
        isSaving,
        setIsSaving,
        controlValues,
        handleIncorrectControlValues,
      } = get();
      const response = await handleFetch({
        pathOrUrl: 'user/me-extended',
        body: {
          extend: [],
        },
        method: 'POST',
      });
      if (
        isSaving ||
        response.statusCode !== StatusCodes.CREATED ||
        !isObject(response.controlValues)
      ) {
        return;
      }
      const newControlValues: ControlValue[] = response.controlValues;
      const typesOfControlValuesWithIncorrectValues: ControlValue[] = [];
      Object.keys(controlValues).forEach((key: ControlValue) => {
        if (controlValues[key] !== newControlValues[key]) {
          typesOfControlValuesWithIncorrectValues.push(key);
        }
      });
      if (typesOfControlValuesWithIncorrectValues.length > 0) {
        setIsSaving(true);
        handleIncorrectControlValues(typesOfControlValuesWithIncorrectValues);
      }
      return;
    },
  }));
};
