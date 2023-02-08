import PropTypes from 'prop-types';
// @mui
import {Box, List, ListItemText} from '@mui/material';
//
import {StyledNavItem} from './styles';
import Iconify from '../iconify';
import {useRouter} from 'next/router';
import Cookies from 'js-cookie';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], setUser, ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} setUser={setUser} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item, setUser }) {
  const router = useRouter();
  const pathname = router.pathname;
  const { title, path, icon } = item;

  return (
    <StyledNavItem
      onClick={() => {
        if (path !== '*logout') {
          return;
        }
        Cookies.remove('jwt_token');
        if (pathname === '/') {
          setUser(undefined);
        } else {
          router.push('/');
        }
      }}
      to={!['*logout', pathname].includes(path) ? path : undefined}
      sx={{
        color: pathname !== path ? 'rgb(59,122,179)' : 'rgb(64,182,132)',
        fontWeight: 800,
        bgcolor: pathname === path ? 'rgb(234,237,239)' : undefined,
        '&:active': pathname !== path && {
          color: 'rgb(59,122,179)',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
        '&:hover': pathname === path && {
          cursor: 'default',
          background: 'rgb(234,237,239)',
        },
      }}
    >
      {typeof icon === 'string' && (
        <Iconify
          icon={icon}
          width={40}
          sx={{ ml: 2, mr: 2, bottom: 34, left: 27 }}
        />
      )}
      <ListItemText disableTypography primary={title} />
    </StyledNavItem>
  );
}
