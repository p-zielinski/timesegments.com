import { Box, Stack, Typography } from '@mui/material';
import { IS_SAVING_HEX, SUPER_LIGHT_SILVER } from '../../../../consts/colors';
import { getHexFromRGBAObject } from '../../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBObject } from '../../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import React from 'react';

export const AddIsNotOpened = ({
  color,
  setEditing,
  isSaving,
  disableHover,
}) => {
  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Box
        onClick={() =>
          isSaving
            ? null
            : setEditing({
                isEditing: 'new',
                isDeleting: false,
              })
        }
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
                a: 0.1,
              }),
          flex: 1,
          border: isSaving
            ? `solid 2px ${getHexFromRGBAObject({
                ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                a: 0.5,
              })}`
            : `solid 2px ${getHexFromRGBAObject({
                ...color.rgb,
                a: 0.3,
              })}`,
          borderRadius: '12px',
          cursor: !isSaving && 'pointer',
          '&:hover': !disableHover &&
            !isSaving && {
              border: `solid 2px ${getHexFromRGBAObject({
                ...color.rgb,
                a: 0.5,
              })}`,
              borderStyle: 'dashed',
              borderRight: 0,
            },
        }}
      >
        <Stack
          spacing={1}
          sx={{ p: 3 }}
          direction="row"
          alignItems="center"
          justifyContent="left"
        >
          <Typography variant="subtitle2" noWrap>
            ADD NOTE FOR LATER
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};
