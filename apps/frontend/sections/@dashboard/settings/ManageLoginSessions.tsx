import { Box, Stack, TextField, Typography } from '@mui/material';
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
import React, { useEffect } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { Timezones } from '@test1/shared';
import { Token } from '@prisma/client';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { SelectWithSearch } from '../../../components/form/SelectWithSearch';

export default function ManageLoginSessions({
  userTokens,
  setUserTokens,
  userTokensFetched,
  setUserTokensFetched,
  currentTokenId,
  disableHover,
  user,
  isSaving,
  setIsSaving,
  setOpenedSettingOption,
  currentSettingOption,
  setCompleted,
}) {
  const { color } = currentSettingOption;
  const router = useRouter();
  const getUserTokens = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'token/all',
      method: 'GET',
    });
    if (response.statusCode === StatusCodes.OK && response.tokens) {
      setUserTokens(response.tokens);
      setUserTokensFetched(true);
      setIsSaving(false);
    }
    return;
  };

  useEffect(() => {
    if (!userTokensFetched) {
      getUserTokens();
    }
  }, [userTokensFetched]);

  const getLoginSessionOptions = (tokens: Token[]) => {
    return tokens.map((token) => {
      const createdAtString = DateTime.fromISO(token.createdAt, {
        zone: Timezones[user.timezone],
      }).toLocaleString({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return {
        value: token.id,
        label:
          token.id === currentTokenId
            ? `Current session, created at: ${createdAtString}`
            : `${token.userAgent}, created at: ${createdAtString}`,
      };
    });
  };

  let StyledTextField, darkHexColor;
  const setStyledTextField = (hexColor) => {
    darkHexColor = isSaving
      ? 'rgb(144, 156, 168)'
      : getHexFromRGBObject(
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

  const revokeSession = async (
    tokenId: string,
    resetForm: () => void,
    setFieldError: (field: string, message: string) => void
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'token/revoke',
      body: { tokenId },
      method: 'POST',
    });
    if (tokenId === currentTokenId) {
      Cookies.remove('jwt_token');
      router.push('/');
      return;
    }
    setUserTokens(userTokens.filter((userToken) => userToken.id !== tokenId));
    if (response.statusCode === StatusCodes.CREATED) {
      setCompleted(true);
    } else {
      await getUserTokens();
      setFieldError('loginSession', response.error || 'Unknown error');
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    loginSession: yup.string().required(),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          loginSession: '',
        }}
        onSubmit={async (
          values,
          { setSubmitting, resetForm, setFieldError }
        ) => {
          await revokeSession(values.loginSession, resetForm, setFieldError);
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
                  <Stack spacing={3} sx={{ mb: 0.8 }}>
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
                    <SelectWithSearch
                      name="loginSession"
                      label="Login session"
                      options={getLoginSessionOptions(userTokens)}
                      TextField={StyledTextField}
                      helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}
                      disabled={isSaving}
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
                    '&:hover': !isSaving &&
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
                      icon={'material-symbols:delete-forever'}
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
                        REVOKE ACCESS
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
                    '&:hover': !isSaving && {
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
                    icon={'mdi:cancel-bold'}
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
          );
        }}
      </Formik>
      {/*<Formik*/}
      {/*  initialValues={initialValues}*/}
      {/*  onSubmit={async (*/}
      {/*    values,*/}
      {/*    { setSubmitting, resetForm, setFieldError }*/}
      {/*  ) => {*/}

      {/*    setSubmitting(false);*/}
      {/*  }}*/}
      {/*  validationSchema={validationSchema}*/}
      {/*>*/}
      {/*  {({ handleSubmit, values, errors }) => {*/}
      {/*    const isFormValid =*/}
      {/*      !Object.keys(errors).length && validationSchema.isValidSync(values);*/}

      {/*    return (*/}
      {/*      <Box sx={{ boxSizing: 'content-box' }}>*/}
      {/*        <Box>*/}
      {/*          <Box*/}
      {/*            sx={{*/}
      {/*              borderTopLeftRadius: '12px',*/}
      {/*              borderTopRightRadius: '12px',*/}
      {/*              cursor: 'auto',*/}
      {/*              minHeight: 54,*/}
      {/*              background: getRepeatingLinearGradient(*/}
      {/*                isSaving ? IS_SAVING_HEX : color.hex,*/}
      {/*                0.3,*/}
      {/*                45,*/}
      {/*                false*/}
      {/*              ),*/}
      {/*              border: `solid 2px ${*/}
      {/*                isSaving*/}
      {/*                  ? IS_SAVING_HEX*/}
      {/*                  : getHexFromRGBAObject({*/}
      {/*                      ...(color.rgb as {*/}
      {/*                        r: number;*/}
      {/*                        g: number;*/}
      {/*                        b: number;*/}
      {/*                      }),*/}
      {/*                      a: 0.3,*/}
      {/*                    })*/}
      {/*              }`,*/}
      {/*              mb: '-3px',*/}
      {/*              borderBottom: '0px',*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            <Box sx={{ p: 2, pt: 3.5 }}>*/}
      {/*              {isSaving && (*/}
      {/*                <Box*/}
      {/*                  sx={{*/}
      {/*                    width: mainBoxRef.current?.clientWidth || '100%',*/}
      {/*                    height: mainBoxRef.current?.clientHeight || '100%',*/}
      {/*                    background: 'transparent',*/}
      {/*                    zIndex: 1,*/}
      {/*                    position: 'absolute',*/}
      {/*                    transform: 'translate(-18px, -26px)',*/}
      {/*                  }}*/}
      {/*                />*/}
      {/*              )}*/}

      {/*              <Stack spacing={2}>*/}
      {/*                <Box key={userTokensFetched}>*/}

      {/*                </Box>*/}
      {/*              </Stack>*/}
      {/*            </Box>*/}
      {/*          </Box>*/}
      {/*          <Box*/}
      {/*            sx={{*/}
      {/*              display: 'flex',*/}
      {/*              width: '100%',*/}
      {/*              background:*/}
      {/*                !isFormValid || isSaving*/}
      {/*                  ? getRepeatingLinearGradient(*/}
      {/*                      isSaving ? IS_SAVING_HEX : '000000',*/}
      {/*                      isSaving ? 0.2 : 0.05,*/}
      {/*                      135,*/}
      {/*                      false*/}
      {/*                    )*/}
      {/*                  : LIGHT_GREEN,*/}
      {/*              minHeight: 58,*/}
      {/*              maxHeight: 58,*/}
      {/*              borderBottomLeftRadius: 12,*/}
      {/*              borderBottomRightRadius: 12,*/}
      {/*              border: isSaving*/}
      {/*                ? `solid 2px ${IS_SAVING_HEX}`*/}
      {/*                : !isFormValid*/}
      {/*                ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                    r: 0,*/}
      {/*                    g: 0,*/}
      {/*                    b: 0,*/}
      {/*                    a: 0.05,*/}
      {/*                  })}`*/}
      {/*                : `solid 2px ${LIGHT_GREEN}`,*/}
      {/*              borderTop: 0,*/}
      {/*              color: isSaving*/}
      {/*                ? IS_SAVING_HEX*/}
      {/*                : !isFormValid*/}
      {/*                ? 'rgba(0,0,0,.2)'*/}
      {/*                : 'black',*/}
      {/*              cursor: !isFormValid || isSaving ? 'default' : 'pointer',*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            <Box*/}
      {/*              sx={{*/}
      {/*                flex: 1,*/}
      {/*                p: 2,*/}
      {/*                margin: `0 0 -2px -2px`,*/}
      {/*                border: isSaving*/}
      {/*                  ? `solid 2px ${IS_SAVING_HEX}`*/}
      {/*                  : !isFormValid*/}
      {/*                  ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                      r: 0,*/}
      {/*                      g: 0,*/}
      {/*                      b: 0,*/}
      {/*                      a: 0.05,*/}
      {/*                    })}`*/}
      {/*                  : `solid 2px ${LIGHT_GREEN}`,*/}
      {/*                borderBottomLeftRadius: 12,*/}
      {/*                borderRight: 0,*/}
      {/*                borderTop: 0,*/}
      {/*                '&:hover': !disableHover &&*/}
      {/*                  !isSaving && {*/}
      {/*                    border: !isFormValid*/}
      {/*                      ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                          r: 0,*/}
      {/*                          g: 0,*/}
      {/*                          b: 0,*/}
      {/*                          a: 0.05,*/}
      {/*                        })}`*/}
      {/*                      : `solid 2px ${GREEN}`,*/}
      {/*                    borderTop: !isFormValid ? 0 : `solid 2px ${GREEN}`,*/}
      {/*                    pt: !isFormValid ? 2 : 1.8,*/}
      {/*                  },*/}
      {/*              }}*/}
      {/*              onClick={() => {*/}
      {/*                !isSaving &&*/}
      {/*                  !Object.keys(errors).length &&*/}
      {/*                  handleSubmit();*/}
      {/*              }}*/}
      {/*            >*/}
      {/*              <Iconify*/}
      {/*                icon={'material-symbols:delete-forever'}*/}
      {/*                width={42}*/}
      {/*                sx={{*/}
      {/*                  m: -2,*/}
      {/*                  position: 'relative',*/}
      {/*                  bottom: -6,*/}
      {/*                  left: 8,*/}
      {/*                }}*/}
      {/*              />*/}
      {/*              <Stack spacing={2} sx={{ ml: 5, mt: -3 }}>*/}
      {/*                <Typography variant="subtitle2" noWrap>*/}
      {/*                  REVOKE ACCESS*/}
      {/*                </Typography>*/}
      {/*              </Stack>*/}
      {/*            </Box>*/}
      {/*            <Box*/}
      {/*              sx={{*/}
      {/*                margin: `0 -2px -2px 0`,*/}
      {/*                cursor: !isSaving && 'pointer',*/}
      {/*                color: !isSaving && 'black',*/}
      {/*                border: isSaving*/}
      {/*                  ? `solid 2px ${IS_SAVING_HEX}`*/}
      {/*                  : !isFormValid*/}
      {/*                  ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                      r: 255,*/}
      {/*                      g: 0,*/}
      {/*                      b: 0,*/}
      {/*                      a: 0.2,*/}
      {/*                    })}`*/}
      {/*                  : `solid 2px ${LIGHT_RED}`,*/}
      {/*                borderLeft: isSaving*/}
      {/*                  ? `solid 2px transparent`*/}
      {/*                  : !isFormValid*/}
      {/*                  ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                      r: 255,*/}
      {/*                      g: 0,*/}
      {/*                      b: 0,*/}
      {/*                      a: 0.2,*/}
      {/*                    })}`*/}
      {/*                  : `solid 2px ${LIGHT_RED}`,*/}
      {/*                borderTop: isSaving*/}
      {/*                  ? `solid 2px transparent`*/}
      {/*                  : !isFormValid*/}
      {/*                  ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*                      r: 255,*/}
      {/*                      g: 0,*/}
      {/*                      b: 0,*/}
      {/*                      a: 0.2,*/}
      {/*                    })}`*/}
      {/*                  : `solid 2px ${LIGHT_RED}`,*/}
      {/*                width: '60px',*/}
      {/*                borderBottomRightRadius: 12,*/}
      {/*                background: isSaving*/}
      {/*                  ? 'transparent'*/}
      {/*                  : !isFormValid*/}
      {/*                  ? `rgba(255, 0, 0, 0.2)`*/}
      {/*                  : LIGHT_RED,*/}
      {/*                '&:hover': !disableHover &&*/}
      {/*                  !isSaving && {*/}
      {/*                    background: LIGHT_RED,*/}
      {/*                    border: `solid 2px ${RED}`,*/}
      {/*                  },*/}
      {/*              }}*/}
      {/*              onClick={() =>*/}
      {/*                !isSaving && setOpenedSettingOption(undefined)*/}
      {/*              }*/}
      {/*            >*/}
      {/*              <Iconify*/}
      {/*                icon={'mdi:cancel-bold'}*/}
      {/*                width={42}*/}
      {/*                sx={{*/}
      {/*                  m: -2,*/}
      {/*                  position: 'relative',*/}
      {/*                  bottom: -22,*/}
      {/*                  right: -24,*/}
      {/*                }}*/}
      {/*              />*/}
      {/*            </Box>*/}
      {/*          </Box>*/}
      {/*        </Box>*/}
      {/*      </Box>*/}
      {/*    );*/}
      {/*  }}*/}
      {/*</Formik>*/}
    </Box>
  );
}
