import { DashboardPageState } from '../../../enum/DashboardPageState';
import { UserAffiliation } from '@test1/shared';
import { DARK_RED } from '../../../consts/colors';

export const navConfig = [
  {
    title: 'Active categories',
    path: '/dashboard',
    icon: 'fluent:shifts-activity-24-filled',
    state: DashboardPageState.ACTIVE_CATEGORIES,
    forWhom: [UserAffiliation.UNCLAIMED, UserAffiliation.CLAIMED],
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
    forWhom: [UserAffiliation.UNCLAIMED, UserAffiliation.CLAIMED],
  },
  {
    title: 'settings',
    path: '/dashboard/settings',
    icon: `material-symbols:settings`,
    state: DashboardPageState.SETTINGS,
    forWhom: [UserAffiliation.UNCLAIMED, UserAffiliation.CLAIMED],
  },
  {
    title: 'logout',
    path: '*logout',
    icon: `material-symbols:logout`,
    forWhom: [UserAffiliation.CLAIMED],
  },
  {
    title: 'delete account',
    path: '*delete-unclaimed-account',
    icon: `material-symbols:delete-outline`,
    forWhom: [UserAffiliation.UNCLAIMED],
    color: DARK_RED,
  },
];

export default navConfig;
