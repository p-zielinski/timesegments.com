import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
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
import {getRandomRgbObjectForSliderPicker} from '../../../utils/getRandomRgbObjectForSliderPicker';
import {capitalizeFirstLetter} from '../../../utils/capitalizeFirstLetter';

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

export default function Nav({ openNav, onCloseNav, user, setUser }) {
  const [color, setColor] = useState(getRandomRgbObjectForSliderPicker().hex);
  const router = useRouter();

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [router.pathname]);

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
          color,
          px: 2.5,
          py: 3,
          display: 'inline-flex',
          fontSize: 20,
        }}
      >
        {process.env.NEXT_PUBLIC_APP_NAME}
      </Typography>

      <Box sx={{ mb: 3, mx: 2.5 }}>
        <Link underline="none">
          <StyledAccount>
            <Box sx={{ ml: 0 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {capitalizeFirstLetter(user.email.split('@')[0] ?? '')}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navConfig} setUser={setUser} />

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
