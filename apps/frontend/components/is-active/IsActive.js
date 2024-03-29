import PropTypes from 'prop-types';
// @mui
import { alpha } from '@mui/material/styles';
import { Box } from '@mui/material';
import { nanoid } from 'nanoid';
import { GREEN, IS_SAVING_HEX, RED } from '../../consts/colors';

// ----------------------------------------------------------------------

IsActive.propTypes = {
  sx: PropTypes.object,
  isActive: PropTypes.bool,
};

export default function IsActive({ isActive, isSaving, sx = {} }) {
  return (
    <Box
      key={nanoid()}
      sx={{
        m: 0,
        width: 16,
        height: 16,
        borderRadius: '50%',
        boxShadow: (theme) =>
          `inset -1px 1px 2px ${alpha(theme.palette.common.black, 0.32)}`,
        bgcolor: isSaving ? IS_SAVING_HEX : isActive ? GREEN : RED,
        ...sx,
      }}
    />
  );
}
