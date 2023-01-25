import {
  SET_SIDEBAR_EXTENDED,
  SET_ADVANCED_FILTERS,
  SET_SHOW_MOBILE_MENU,
  SET_LIMIT_TAGS,
} from '../types';

export const setLimitTags = (value: number) => async (dispatch) => {
  dispatch({
    type: SET_LIMIT_TAGS,
    payload: value,
  });
};

export const setSidebarExtended = (value: boolean) => async (dispatch) => {
  dispatch({
    type: SET_SIDEBAR_EXTENDED,
    payload: value,
  });
};

export const setAdvancedFilters = (value: boolean) => async (dispatch) => {
  dispatch({
    type: SET_ADVANCED_FILTERS,
    payload: value,
  });
};

export const setShowMobileMenu = (value: boolean) => async (dispatch) => {
  dispatch({
    type: SET_SHOW_MOBILE_MENU,
    payload: value,
  });
};
