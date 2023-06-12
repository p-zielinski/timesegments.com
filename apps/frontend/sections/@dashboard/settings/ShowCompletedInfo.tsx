import { Box, Typography } from '@mui/material';
import React from 'react';
import { getBackgroundColor } from '../../../utils/colors/getBackgroundColor';
import Iconify from '../../../components/iconify';

export default function ShowCompletedInfoSettings({
  isSaving,
  setOpenedSettingOption,
  currentSettingOption,
  disableHover,
}) {
  return (
    <Box
      key={`${currentSettingOption.id}_success`}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.4, currentSettingOption.color.hex),
        borderRadius: '10px',
        border: `solid 1px ${getBackgroundColor(
          0.4,
          currentSettingOption.color.hex
        )}`,
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '52px',
        '&:hover': !disableHover &&
          !isSaving && {
            cursor: 'pointer',
            border: `solid 1px ${getBackgroundColor(
              1,
              currentSettingOption.color.hex
            )}`,
          },
      }}
      onClick={() => !isSaving && setOpenedSettingOption()}
    >
      <Box sx={{ display: 'flex', mr: '-12px' }}>
        <Box
          sx={{
            ml: '-3px',
            pr: '-3px',
            color: currentSettingOption.color.hex,
          }}
          onClick={() => !isSaving && null}
        >
          <Iconify
            icon={'fluent-emoji-high-contrast:red-exclamation-mark'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignContent: 'flex-start',
            gap: '10px',
            flex: 1,
          }}
        >
          <Box sx={{ margin: '6px', marginLeft: '-5px' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: isSaving ? '#637381' : undefined }}
            >
              {currentSettingOption.successText}
            </Typography>
            <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 0 }}
              >
                {currentSettingOption.subtitle}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
