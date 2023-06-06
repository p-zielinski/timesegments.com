import { DashboardPageState } from '../../../enum/DashboardPageState';

const navConfig = [
  {
    title: 'Time Segments',
    path: '/dashboard',
    icon: 'fluent:shifts-activity-24-filled',
    state: DashboardPageState.CATEGORIES,
  },
  {
    title: 'Recent Notes',
    path: '/notes',
    icon: 'material-symbols:note-alt-outline',
    state: DashboardPageState.NOTES,
  },
  {
    title: 'Time Logs',
    path: '/dashboard/time-segments',
    icon: `icon-park-twotone:database-time`,
    state: DashboardPageState.TIME_SEGMENTS,
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
