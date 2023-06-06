import { DashboardPageState } from '../../../enum/DashboardPageState';

const navConfig = [
  {
    title: 'Active categories',
    path: '/dashboard',
    icon: 'fluent:shifts-activity-24-filled',
    state: DashboardPageState.ACTIVE_CATEGORIES,
  },
  // {
  //   title: 'Notes',
  //   path: '/notes',
  //   icon: 'material-symbols:note-outline',
  //   state: DashboardPageState.NOTES,
  // },
  {
    title: 'Time Logs',
    path: '/dashboard/time-logs',
    icon: `icon-park-twotone:database-time`,
    state: DashboardPageState.TIME_LOGS,
  },
  {
    title: 'settings',
    path: '/dashboard/settings',
    icon: `material-symbols:settings`,
    state: DashboardPageState.SETTINGS,
  },
  {
    title: 'logout',
    path: '*logout',
    icon: `material-symbols:logout`,
  },
];

export default navConfig;
