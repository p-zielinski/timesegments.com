import { Box, Stack, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_SILVER,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../../../consts/colors';
import { getHexFromRGBAObject } from '../../../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBObject } from '../../../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import React from 'react';
import Iconify from '../../../../../components/iconify';
import { getRepeatingLinearGradient } from '../../../../../utils/colors/getRepeatingLinearGradient';
import { handleFetch } from '../../../../../utils/handleFetch';
import { StatusCodes } from 'http-status-codes';

export const AddIsNotOpened = ({
  controlValue,
  setControlValue,
  user,
  setUser,
  userNotes,
  color,
  setIsOpen,
  isSaving,
  setIsSaving,
  disableHover,
}) => {
  const { expandNotes } = user;

  const reverseExpandNotes = async () => {
    setIsSaving(true);
    setUser({ ...user, expandNotes: !expandNotes });
    const response = await handleFetch({
      pathOrUrl: 'user/set-expand-notes',
      body: {
        expandNotes: !expandNotes,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.controlValue) {
      setControlValue(response.controlValue);
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      setIsSaving(true);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Box
        onClick={() => (isSaving ? null : setIsOpen(true))}
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
          borderRight: 0,
          borderRadius: '12px',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
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
      {userNotes.length > 0 ? (
        <Box
          sx={{
            width: `60px`,
            p: 2,
            color: isSaving ? IS_SAVING_HEX : !expandNotes ? GREEN : RED,
            background: `white`,
            border: `solid 2px ${LIGHT_SILVER}`,
            borderLeft: `0px`,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
            cursor: !isSaving && 'pointer',
            '&:hover': !disableHover &&
              !isSaving && {
                borderLeft: `0px`,
              },
          }}
          onClick={() => !isSaving && reverseExpandNotes()}
        >
          <Iconify
            icon={expandNotes ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
            width={50}
            sx={{ position: 'relative', m: -2, mt: '-7px', ml: '-10px' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: `60px`,
            minWidth: '60px',
            p: 2,
            background: getRepeatingLinearGradient(
              isSaving ? IS_SAVING_HEX : color.hex,
              0.3
            ),
            border: isSaving
              ? `solid 2px ${getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                  a: 0.5,
                })}`
              : `solid 2px ${getHexFromRGBAObject({
                  ...color.rgb,
                  a: 0.3,
                })}`,
            borderLeft: 0,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      )}
    </Box>
  );
};
