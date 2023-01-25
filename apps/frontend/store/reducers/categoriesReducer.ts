import {
  SET_SIDEBAR_EXTENDED,
  SET_ADVANCED_FILTERS,
  SET_SHOW_MOBILE_MENU,
  SET_LIMIT_TAGS,
} from '../types';
import { CategoriesPageMode } from '../../enum/categoriesPageMode';
import { ColumnSortOption } from '@test1/shared';

const initialState = {
  categories: [],
  isEditing: {
    categoryId: null,
    subcategoryId: null,
    createNew: null,
  },
  mode: CategoriesPageMode.VIEW,
  order: ColumnSortOption.NEWEST,
};

const categoriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LIMIT_TAGS:
      return {
        ...state,
        limitTags: action.payload,
      };

    case SET_SIDEBAR_EXTENDED:
      return {
        ...state,
        sidebarExtended: action.payload,
      };

    case SET_ADVANCED_FILTERS:
      return {
        ...state,
        advancedFilters: action.payload,
      };

    case SET_SHOW_MOBILE_MENU:
      return {
        ...state,
        showMobileMenu: action.payload,
      };

    default:
      return state;
  }
};

export default categoriesReducer;
