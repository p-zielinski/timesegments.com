import PropTypes from 'prop-types';
// @mui
import {Box, List, ListItemText} from '@mui/material'; //
import {StyledNavItem} from './styles';
import Iconify from '../iconify';
import {useRouter} from 'next/router';
import Cookies from 'js-cookie';
import {handleFetch} from '../../utils/fetchingData/handleFetch';
import {getIsPageState} from '../../utils/getIsPageState';
import {useContext} from 'react';
import {StoreContext} from '../../hooks/useStore';
import {useStore} from 'zustand';

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

function NavItem({ item }) {
  const store = useContext(StoreContext);
  const { user } = useStore(store);

  const router = useRouter();
  const { title, path, icon, query } = item;

  const isSelected = getIsPageState({
    urlObject: new URL(window.location.href),
    configItem: item,
  });

  const revokeCurrentToken = async () => {
    await handleFetch({
      pathOrUrl: 'token/revoke-current',
      method: 'POST',
    });
  };

  const deleteUnclaimedAccount = async () => {
    await handleFetch({
      pathOrUrl: 'user/delete-unclaimed-account',
      method: 'POST',
    });
  };

  return (
    <StyledNavItem
      onClick={async () => {
        switch (path) {
          case '*logout':
            if (user.email) {
              revokeCurrentToken();
            } else {
              deleteUnclaimedAccount();
            }
            Cookies.remove('jwt_token');
            router.push('/');
            return;
          default:
            if (router.pathname === path) {
              const currentUrl = new URL(window.location.href);
              const origin = currentUrl.origin;
              const pathname = currentUrl.pathname;
              if (query) {
                const desiredQuery = new URLSearchParams(query).toString();
                return window.history.replaceState(
                  null,
                  '',
                  origin + pathname + '?' + desiredQuery
                );
              }
              window.history.replaceState(null, '', origin + pathname);
            }
            if (query) {
              return router.push(
                path + '?' + new URLSearchParams(query).toString()
              );
            }
            return router.push(path);
        }
      }}
      sx={{
        color: isSelected ? 'rgb(59,122,179)' : 'rgb(64,182,132)',
        fontWeight: 800,
        bgcolor: isSelected ? 'rgb(234,237,239)' : undefined,
        '&:active': isSelected && {
          color: 'rgb(59,122,179)',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
        '&:hover': isSelected && {
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
