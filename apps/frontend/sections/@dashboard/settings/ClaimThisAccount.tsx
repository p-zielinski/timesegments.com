import {
  Box,
  Card,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import Iconify from '../../../components/iconify';
import React, { useContext, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import InputText from '../../../components/form/Text';
import { StatusCodes } from 'http-status-codes';
import YupPassword from 'yup-password';
import { equalTo } from '../../../utils/yupCustomMethods';
import { useStore } from 'zustand';
import { StoreContext } from '../../../hooks/useStore';
import loginSchema from '../../../yupSchemas/login';

YupPassword(yup); // extend yup
yup.addMethod(yup.string, 'equalTo', (ref, msg) =>
  equalTo(ref, msg, 'new password')
);

export default function ClaimThisAccount({
  setOpenedSettingOption,
  currentSettingOption,
  setCompleted,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const store = useContext(StoreContext);
  const { disableHover, isSaving, setIsSaving } = useStore(store);
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

  const claimThisAccount = async (
    email: string,
    password: string,
    setFieldError: (field: string, message: string) => void
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/claim-this-account',
      body: { email, password },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    }
    if (response.statusCode === StatusCodes.BAD_REQUEST) {
      const error = response.error || '';
      if (error.match(/password/i)) {
        setFieldError('password', error);
      }
      if (error.match(/email/i)) {
        setFieldError('email', error);
      }
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = loginSchema;

  return (
    <Card>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          await claimThisAccount(values.email, values.password, setFieldError);
          setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, values, setFieldValue }) => {
          const isFormValid = validationSchema.isValidSync(values);

          const backgroundColor = getHexFromRGBAObject(
            getRgbaObjectFromHexString(
              isSaving
                ? IS_SAVING_HEX
                : getHexFromRGBAObject(
                    getColorShadeBasedOnSliderPickerSchema(
                      getRgbaObjectFromHexString(color?.hex),
                      'bright'
                    )
                  ),
              0.2
            )
          );

          return (
            <Card>
              <Box>
                <Box
                  sx={{
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    cursor: 'auto',
                    background: backgroundColor,
                    border: `solid 1px ${backgroundColor}`,
                    borderBottom: '0px',
                  }}
                >
                  <Box sx={{ p: 1.5, pt: 0 }}>
                    {isSaving && (
                      <Box
                        sx={{
                          width: 'calc(100% + 20px)',
                          height: 'calc(100% + 20px)',
                          background: 'transparent',
                          position: 'absolute',
                          zIndex: 1,
                          transform: 'translate(-10px, -10px)',
                        }}
                      />
                    )}
                    <Stack spacing={2} sx={{ mt: 0.5 }}>
                      <Box
                        sx={{
                          filter: isSaving ? 'grayscale(100%)' : 'none',
                          cursor: isSaving ? 'default' : 'pointer',
                        }}
                      >
                        {isSaving && (
                          <Box
                            sx={{
                              width: 'calc(100% + 20px)',
                              height: 'calc(100% + 20px)',
                              background: 'transparent',
                              position: 'absolute',
                              zIndex: 1,
                              transform: 'translate(-10px, -10px)',
                            }}
                          />
                        )}
                      </Box>
                      <InputText
                        type="text"
                        name="email"
                        label="Email address"
                        TextField={StyledTextField}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving}
                      />

                      <InputText
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setShowPassword(!showPassword);
                              }}
                              edge="end"
                            >
                              <Iconify
                                icon={
                                  showPassword
                                    ? ('eva:eye-fill' as any)
                                    : ('eva:eye-off-fill' as any)
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        }
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        label="Password"
                        TextField={StyledTextField}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                      />
                    </Stack>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      background:
                        !isFormValid || isSaving
                          ? SUPER_LIGHT_SILVER
                          : LIGHT_GREEN,
                      borderBottomLeftRadius: 12,
                      border: `solid 1px ${
                        isSaving || !isFormValid
                          ? SUPER_LIGHT_SILVER
                          : LIGHT_GREEN
                      }`,
                      color: isSaving
                        ? IS_SAVING_HEX
                        : !isFormValid
                        ? 'rgba(0,0,0,.2)'
                        : 'black',
                      cursor: !isFormValid || isSaving ? 'default' : 'pointer',
                      flex: 1,
                      '&:hover': !disableHover &&
                        !isSaving &&
                        isFormValid && {
                          border: !isFormValid
                            ? `solid 1px ${getHexFromRGBAObject({
                                r: 0,
                                g: 0,
                                b: 0,
                                a: 0.05,
                              })}`
                            : `solid 1px ${GREEN}`,
                        },
                    }}
                    onClick={() => {
                      !isSaving && handleSubmit();
                    }}
                  >
                    <Box
                      sx={{
                        p: '5px',
                      }}
                    >
                      <Iconify
                        icon={'material-symbols:save-outline'}
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
                          SAVE NEW PASSWORD
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
                      pl: '5px',
                      pr: '5px',
                      border: `solid 1px ${
                        isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED
                      }`,
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
        }}
      </Formik>
    </Card>
  );
}
