import { DashboardPageState } from '../enum/DashboardPageState';

export const getIsPageState = ({
  urlObject,
  configItem,
}: {
  urlObject?: URL;
  configItem: {
    title: string;
    path: string;
    icon: string;
    state?: DashboardPageState;
  };
}) => {
  const { path } = configItem;
  if (urlObject) {
    return path === urlObject.pathname;
  }
  throw 'urlObject must be passed into getIsPageState function';
};
