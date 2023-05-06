import PropTypes from 'prop-types';
// @mui
import {Box, List, ListItemText} from '@mui/material'; //
import {StyledNavItem} from './styles';
import Iconify from '../iconify';
import {useRouter} from 'next/router';
import Cookies from 'js-cookie';
import {handleFetch} from '../../utils/handleFetch';
import {useEffect, useState} from 'react';
import {getIsPageState} from '../../utils/getIsPageState'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({
  data = [],
  setUser,
  currentPageState,
  setCurrentPageState,
  ...other
}) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem
            key={item.title}
            item={item}
            setUser={setUser}
            currentPageState={currentPageState}
            setCurrentPageState={setCurrentPageState}
          />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item, currentPageState, setCurrentPageState }) {
  const router = useRouter();
  const { title, path, icon, query } = item;

  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const urlObject = new URL(window.location.href);
    setIsSelected(getIsPageState({ urlObject, configItem: item }));
  }, [currentPageState]);

  const revokeCurrentToken = async () => {
    await handleFetch({
      pathOrUrl: 'token/revoke-current',
      method: 'POST',
    });
  };

  return (
    <StyledNavItem
      onClick={async () => {
        if (typeof setCurrentPageState === 'function') {
          setCurrentPageState(item.state);
        }
        switch (path) {
          case '*logout':
            revokeCurrentToken();
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
