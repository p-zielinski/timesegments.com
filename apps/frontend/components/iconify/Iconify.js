import PropTypes from 'prop-types';
// icons
import { Icon } from '@iconify/react';
// @mui
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

// eslint-disable-next-line react/display-name
export const Iconify = ({ icon, width = 25, sx, ...other }, ref) => (
  <Box sx={{ width, height: width, ...sx }}>
    <Icon icon={icon} width={'100%'} height={'100%'} />
  </Box>
);

Iconify.propTypes = {
  sx: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Iconify;
