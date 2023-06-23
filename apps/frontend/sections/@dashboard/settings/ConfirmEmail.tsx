import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
  ULTRA_LIGHT_RED,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import React, { useState } from 'react';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function ConfirmEmail({
  user,
  disableHover,
  isSaving,
  setIsSaving,
  setOpenedSettingOption,
  currentSettingOption,
  setCompleted,
}) {
  const { color } = currentSettingOption;
  let StyledTextField, darkHexColor;
  const setStyledTextField = (hexColor) => {
    darkHexColor = getHexFromRGBObject(
      getColorShadeBasedOnSliderPickerSchema(
        getRgbaObjectFromHexString(hexColor)
      )
    );
    StyledTextField = styled(TextField)({
      '& input': {
        color: darkHexColor,
      },
      '& label.Mui-focused': {
        color: darkHexColor,
      },
      '& label': {
        color: darkHexColor,
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: hexColor,
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: hexColor,
        },
        '&:hover fieldset': {
          borderColor: hexColor,
        },
        '&.Mui-focused fieldset': {
          borderColor: hexColor,
        },
      },
    });
  };
  setStyledTextField(isSaving ? IS_SAVING_HEX : color.hex);

  const [error, setError] = useState<string>();

  const resendConfirmationEmail = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/resend-confirmation-email',
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    }
    if (response.error) {
      setError(
        typeof response.error === 'string' ? response.error : 'Unknown error'
      );
    }
    setIsSaving(false);
    return;
  };

  return (
    <Card>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '54px',
        }}
      >
        {error ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              background: ULTRA_LIGHT_RED,
              flex: 1,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Box sx={{ ml: 1 }}>
                <Iconify
                  icon={'ph:warning-fill'}
                  width={40}
                  sx={{
                    color: 'rgb(191,64,64)',
                    position: 'relative',
                    top: '50%',
                    left: '40%',
                    transform: 'translate(-40%, -50%)',
                  }}
                />
              </Box>
              <Box sx={{ p: 1 }}>
                <Stack>
                  <Typography variant="subtitle2" noWrap>
                    Error: {error}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_GREEN,
              borderBottomLeftRadius: 12,
              borderTopLeftRadius: 12,
              border: `solid 1px ${
                isSaving ? SUPER_LIGHT_SILVER : LIGHT_GREEN
              }`,
              color: isSaving ? IS_SAVING_HEX : undefined,
              cursor: isSaving ? 'default' : 'pointer',
              flex: 1,
              '&:hover': !disableHover &&
                !isSaving && {
                  border: `solid 1px ${GREEN}`,
                },
            }}
            onClick={() => {
              !isSaving && resendConfirmationEmail();
            }}
          >
            <Box
              sx={{
                ml: 1,
              }}
            >
              <Iconify
                icon={'mdi:email-send-outline'}
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
                position: 'relative',
                pl: 1,
              }}
            >
              <Stack
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(0, -50%)',
                }}
              >
                <Typography variant="subtitle2" noWrap>
                  SEND EMAIL WITH CONFIRMATION LINK
                </Typography>
              </Stack>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED,
            borderBottomRightRadius: 14,
            borderTopRightRadius: 14,
            pl: '5px',
            pr: '5px',
            border: `solid 1px ${isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED}`,
            color: isSaving ? IS_SAVING_HEX : 'black',
            cursor: isSaving ? 'default' : 'pointer',
            '&:hover': !disableHover &&
              !isSaving && {
                background: LIGHT_RED,
                border: `solid 1px ${RED}`,
              },
          }}
          onClick={() => {
            if (isSaving) {
              return;
            }
            setOpenedSettingOption(undefined);
          }}
        >
          <Iconify
            icon={'eva:close-outline'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
