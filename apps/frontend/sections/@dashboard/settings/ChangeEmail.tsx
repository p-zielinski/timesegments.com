import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import Iconify from '../../../components/iconify';
import React from 'react';
import * as yup from 'yup';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import emailRegexp from '../../../regex/email';

export default function ChangeEmail({
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

  const sendChangeEmailAddressEmail = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/send-change-email-address-email',
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    }
    setIsSaving(false);
    return;
  };

  const changeEmail = async (
    currentEmailToLowerCase: string,
    setFieldError: (field: string, message: string) => void
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'email/send-change-email-address-email',
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    }
    if (response.error && typeof response.error === 'string') {
      setFieldError('newEmail', response.error);
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    currentEmail: yup
      .string()
      .matches(emailRegexp, 'Please enter a valid email')
      .required()
      .label('Current email'),
  });

  return (
    <Card>
      <Box>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: '54px',
          }}
        >
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
              color: isSaving ? IS_SAVING_HEX : 'black',
              cursor: isSaving ? 'default' : 'pointer',
              flex: 1,
              '&:hover': !disableHover &&
                !isSaving &&
                true && {
                  border: `solid 1px ${GREEN}`,
                },
            }}
            onClick={() => {
              !isSaving && sendChangeEmailAddressEmail();
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
                  SEND EMAIL WITH INSTRUCTION
                </Typography>
              </Stack>
            </Box>
          </Box>
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
      </Box>
    </Card>
  );
}
