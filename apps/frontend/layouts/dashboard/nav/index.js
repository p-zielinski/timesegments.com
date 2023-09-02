import PropTypes from 'prop-types';
import React, {useContext, useEffect} from 'react';
// @mui
import {alpha, styled} from '@mui/material/styles';
import {Box, Drawer, Link, Typography} from '@mui/material';
// mock
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
//
import navConfig from './config';
import {useRouter} from 'next/router';
import {capitalizeFirstLetter} from '../../../utils/capitalizeFirstLetter';
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {useStore} from 'zustand';
import {StoreContext} from '../../../hooks/useStore';
import {SettingOption} from '../../../enum/settingOption';
import {UserAffiliation} from '@test1/shared';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav, randomSliderHexColor }) {
  const store = useContext(StoreContext);
  const { user, setUser, setOpenedSettingOption } = useStore(store);

  const router = useRouter();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [router.pathname]);

  const getNavConfig = () => {
    const userAffiliation = user?.email
      ? UserAffiliation.CLAIMED
      : UserAffiliation.UNCLAIMED;
    return navConfig.filter((config) =>
      config.forWhom?.includes?.(userAffiliation)
    );
  };

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: getHexFromRGBAObject({ r: 0, g: 0, b: 0, a: 0.7 }),
          px: 2.5,
          py: 3,
          display: 'inline-flex',
          fontSize: 20,
        }}
      >
        TimeSeg
        <span
          style={{
            color: randomSliderHexColor,
          }}
        >
          ment
        </span>
        s.com
      </Typography>

      <Box sx={{ mb: 3, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Box sx={{ ml: 0 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {user.email ? (
                  user.name ||
                  capitalizeFirstLetter(user.email.split('@')[0] ?? '')
                ) : (
                  <Link
                    variant="subtitle2"
                    underline="hover"
                    sx={{ cursor: 'pointer', color: 'rgb(191,64,64)' }}
                    onClick={() => {
                      setOpenedSettingOption(SettingOption.CLAIM_THIS_ACCOUNT);
                      router.push(
                        '/dashboard/settings?option=CLAIM_THIS_ACCOUNT'
                      );
                    }}
                  >
                    Claim this account!
                  </Link>
                )}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={getNavConfig()} setUser={setUser} />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
