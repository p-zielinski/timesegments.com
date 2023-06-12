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
    name: yup.string().test({
      test: (value) => {
        return (value || '') !== (user.name || '');
      },
      message: 'Name cannot be the same as the current one',
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
