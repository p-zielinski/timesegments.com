import {Dispatch, SetStateAction, useState} from 'react'; // @mui
import {styled} from '@mui/material/styles'; //
import Header from './header';
import Nav from './nav';
import {DashboardPageState} from '../../enum/DashboardPageState';
import {Category, User} from '@prisma/client'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------

export default function DashboardLayout({
  children,
  user,
  setUser,
  title,
  randomSliderHexColor,
}: {
  children: any;
  user: User;
  setUser?: Dispatch<SetStateAction<User & { categories: Category[] }>>;
  title?: string;
  currentPageState?: DashboardPageState;
  setCurrentPageState?: (dashboardPageState: DashboardPageState) => void;
  randomSliderHexColor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <Header onOpenNav={() => setOpen(true)} title={title} />

      <Nav
        openNav={open}
        onCloseNav={() => setOpen(false)}
        user={user}
        setUser={setUser}
        randomSliderHexColor={randomSliderHexColor}
      />

      <Main>{children}</Main>
    </StyledRoot>
  );
}
