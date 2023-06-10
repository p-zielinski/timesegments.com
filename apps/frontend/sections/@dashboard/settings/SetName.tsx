import { Box, Card, Stack, TextField, Typography } from '@mui/material';
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
import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../../../components/form/Text';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function SetName({
  controlValue,
  setControlValue,
  disableHover,
  user,
  isSaving,
  setIsSaving,
  currentSettingOption,
  setUser,
  setOpenedSettingOption,
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

  const saveName = async (name: string) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/set-name',
      body: { name, controlValue },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setUser({ ...user, name });
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
      setCompleted(true);
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    name: yup.string().test((value) => {
      return value !== (user.name || '');
    }),
  });

  return (
    <Card>
      <Formik
        initialValues={{
          name: user.name || '',
        }}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          await saveName(values.name);
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
                    <Stack spacing={3}>
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
                        name={'name'}
                        label={`Your name`}
                        TextField={StyledTextField}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
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
                          SAVE NAME
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

      {/*<Formik*/}
      {/*  initialValues={initialValues}*/}
      {/*  onSubmit={async (values, { setSubmitting, resetForm }) => {*/}
      {/*    await saveName(values.name, resetForm);*/}
      {/*    setSubmitting(false);*/}
      {/*  }}*/}
      {/*  validationSchema={validationSchema}*/}
      {/*>*/}
      {/*  {({ handleSubmit, values }) => {*/}
      {/*    const isFormValid = validationSchema.isValidSync(values);*/}

      {/*    return (*/}
      {/*      <Card>*/}
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
      {/*              borderBottom: '0px',*/}
      {/*            }}*/}
      {/*          >*/}
      {/*            <Box sx={{ p: 2, pt: 3.5, pb: 1.5 }}>*/}
      {/*              {isSaving && (*/}
      {/*                <Box*/}
      {/*                  sx={{*/}
      {/*                    width: 'calc(100% + 20px)',*/}
      {/*                    height: 'calc(100% + 20px)',*/}
      {/*                    background: 'transparent',*/}
      {/*                    position: 'absolute',*/}
      {/*                    zIndex: 1,*/}
      {/*                    transform: 'translate(-20px, -20px)',*/}
      {/*                  }}*/}
      {/*                />*/}
      {/*              )}*/}
      {/*              <InputText*/}
      {/*                type="text"*/}
      {/*                name={'name'}*/}
      {/*                label={`Your name`}*/}
      {/*                TextField={StyledTextField}*/}
      {/*                helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}*/}
      {/*                disabled={isSaving}*/}
      {/*              />*/}
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
      {/*                !isSaving && handleSubmit();*/}
      {/*              }}*/}
      {/*            >*/}
      {/*              <Iconify*/}
      {/*                icon={'material-symbols:save-outline'}*/}
      {/*                width={42}*/}
      {/*                sx={{*/}
      {/*                  m: -2,*/}
      {/*                  position: 'absolute',*/}
      {/*                  bottom: 25,*/}
      {/*                  left: 25,*/}
      {/*                }}*/}
      {/*              />*/}
      {/*              <Stack spacing={2} sx={{ ml: 5 }}>*/}
      {/*                <Typography variant="subtitle2" noWrap>*/}
      {/*                  SAVE NAME*/}
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
      {/*                  position: 'absolute',*/}
      {/*                  bottom: 26,*/}
      {/*                  right: 24,*/}
      {/*                }}*/}
      {/*              />*/}
      {/*            </Box>*/}
      {/*          </Box>*/}
      {/*        </Box>*/}
      {/*      </Card>*/}
      {/*    );*/}
      {/*  }}*/}
      {/*</Formik>*/}
    </Card>
  );
}
