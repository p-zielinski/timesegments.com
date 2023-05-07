import { Box, Stack, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../../utils/colors/getRepeatingLinearGradient';
import {
  IS_SAVING_HEX,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../../consts/colors';
import { getHexFromRGBAObject } from '../../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBObject } from '../../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import React from 'react';

export default function ShowCompletedInfoNotes({
  isSaving,
  color,
  disableHover,
  completedInfo,
  setIsOpen,
}: {
  isSaving: boolean;
  color: { rgb: { r: number; g: number; b: number; a: number }; hex: string };
  disableHover: boolean;
  completedInfo: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Box key={'passwordChanged'}>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Box
          sx={{
            color: isSaving
              ? IS_SAVING_HEX
              : getHexFromRGBObject(
                  getColorShadeBasedOnSliderPickerSchema(color.rgb, 'normal')
                ),
            background: isSaving
              ? SUPER_LIGHT_SILVER
              : getHexFromRGBAObject({
                  ...color.rgb,
                  a: 0.24,
                }),
            flex: 1,
            border: isSaving
              ? `solid 2px ${getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                  a: 0.5,
                })}`
              : `solid 2px ${getHexFromRGBAObject({
                  ...color.rgb,
                  a: 0.5,
                })}`,
            borderRight: 0,
            borderRadius: '12px',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            cursor: !isSaving && 'pointer',
            '&:hover': !disableHover &&
              !isSaving && {
                border: `solid 2px ${RED}`,
                borderStyle: 'solid',
                borderRight: 0,
              },
          }}
          onClick={() => {
            if (isSaving) {
              return;
            }
            setIsOpen(false);
          }}
        >
          <Stack
            spacing={1}
            sx={{ p: 2.6 }}
            direction="row"
            alignItems="center"
            justifyContent="left"
          >
            <Typography variant="subtitle2" noWrap sx={{ fontSize: 18 }}>
              {completedInfo}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={{
            width: `60px`,
            minWidth: '60px',
            p: 2,
            background: getRepeatingLinearGradient(
              isSaving ? IS_SAVING_HEX : color.hex,
              0.3,
              135
            ),
            border: isSaving
              ? `solid 2px ${getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                  a: 0.5,
                })}`
              : `solid 2px ${getHexFromRGBAObject({
                  ...color.rgb,
                  a: 0.5,
                })}`,
            borderLeft: 0,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      </Box>
    </Box>
  );
}
