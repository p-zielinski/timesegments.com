import { isEqual } from 'lodash';
import { getQueryObjectFromUrlObject } from './getQueryObjectFromUrlObject';
import { NextRouter } from 'next/router';
import { DashboardPageState } from '../enum/DashboardPageState';

export const getIsPageState = ({
  urlObject,
  configItem,
  router,
}: {
  urlObject?: URL;
  configItem: {
    title: string;
    path: string;
    query?: any;
    icon: string;
    state?: DashboardPageState;
  };
  router?: NextRouter;
}) => {
  const { path, query } = configItem;
  if (router) {
    if (!query) {
      return path === router.pathname;
    }
    return path === router.pathname && isEqual(router.query, query);
  }
  if (urlObject) {
    if (!query) {
      return path === urlObject.pathname;
    }
    return (
      path === urlObject.pathname &&
      isEqual(getQueryObjectFromUrlObject(urlObject), query)
    );
  }
  throw 'urlObject or router must be passed into getIsPageState function';
};
