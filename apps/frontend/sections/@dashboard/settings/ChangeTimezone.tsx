import { Box, Stack, TextField, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import Iconify from '../../../components/iconify';
import React, { useRef, useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { timezoneOptionsForSelect } from '../Form/timezoneOptionsForSelect';
import { SelectWithSearch } from '../../../components/form/SelectWithSearch';
import { Timezones } from '@test1/shared';

export default function ChangeTimezone({
  controlValue,
  setControlValue,
  disableHover,
  user,
  isSaving,
  setIsSaving,
  color,
  setUser,
  setOpenedSettingOption,
}) {
  const mainBoxRef = useRef(null);
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

  const [initialValues, setInitialValues] = useState({
    timezone: Timezones[user.timezone] || '',
  });

  const saveTimezone = async (timezone: string, resetForm: () => void) => {
    setInitialValues({
      timezone,
    });
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/change-timezone',
      body: { timezone, controlValue },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      resetForm();
      setUser({ ...user, timezone });
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setInitialValues({
        timezone: Timezones[user.timezone],
      });
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    timezone: yup.string().test((value) => {
      return value !== (Timezones[user.timezone] || '');
    }),
  });

  return (
    <Box key={initialValues.timezone + isSaving} ref={mainBoxRef}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          await saveTimezone(values.timezone, resetForm);
          setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, values }) => {
          const isFormValid = validationSchema.isValidSync(values);

          return (
            <Box sx={{ boxSizing: 'content-box' }}>
              <Box>
                <Box
                  sx={{
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    cursor: 'auto',
                    minHeight: 54,
                    background: getRepeatingLinearGradient(
                      isSaving ? IS_SAVING_HEX : color.hex,
                      0.3,
                      45,
                      false
                    ),
                    border: `solid 2px ${
                      isSaving
                        ? IS_SAVING_HEX
                        : getHexFromRGBAObject({
                            ...(color.rgb as {
                              r: number;
                              g: number;
                              b: number;
                            }),
                            a: 0.3,
                          })
                    }`,
                    mb: '-3px',
                    borderBottom: '0px',
                  }}
                >
                  <Box sx={{ p: 2, pt: 3.5 }}>
                    {isSaving && (
                      <Box
                        sx={{
                          width: mainBoxRef.current?.clientWidth || '100%',
                          height: mainBoxRef.current?.clientHeight || '100%',
                          background: 'transparent',
                          zIndex: 1,
                          position: 'absolute',
                          transform: 'translate(-18px, -26px)',
                        }}
                      />
                    )}

                    <Stack spacing={2}>
                      <Box>
                        <SelectWithSearch
                          name="timezone"
                          groupBy={(option) => option.groupBy}
                          label="Timezone"
                          options={timezoneOptionsForSelect}
                          TextField={StyledTextField}
                          helperTextColor={
                            isSaving ? IS_SAVING_HEX : darkHexColor
                          }
                          disabled={isSaving}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    background:
                      !isFormValid || isSaving
                        ? getRepeatingLinearGradient(
                            isSaving ? IS_SAVING_HEX : '000000',
                            isSaving ? 0.2 : 0.05,
                            135,
                            false
                          )
                        : LIGHT_GREEN,
                    minHeight: 58,
                    maxHeight: 58,
                    borderBottomLeftRadius: 12,
                    borderBottomRightRadius: 12,
                    border: isSaving
                      ? `solid 2px ${IS_SAVING_HEX}`
                      : !isFormValid
                      ? `solid 2px ${getHexFromRGBAObject({
                          r: 0,
                          g: 0,
                          b: 0,
                          a: 0.05,
                        })}`
                      : `solid 2px ${LIGHT_GREEN}`,
                    borderTop: 0,
                    color: isSaving
                      ? IS_SAVING_HEX
                      : !isFormValid
                      ? 'rgba(0,0,0,.2)'
                      : 'black',
                    cursor: !isFormValid || isSaving ? 'default' : 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      margin: `0 0 -2px -2px`,
                      border: isSaving
                        ? `solid 2px ${IS_SAVING_HEX}`
                        : !isFormValid
                        ? `solid 2px ${getHexFromRGBAObject({
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 0.05,
                          })}`
                        : `solid 2px ${LIGHT_GREEN}`,
                      borderBottomLeftRadius: 12,
                      borderRight: 0,
                      borderTop: 0,
                      '&:hover': !disableHover &&
                        !isSaving && {
                          border: !isFormValid
                            ? `solid 2px ${getHexFromRGBAObject({
                                r: 0,
                                g: 0,
                                b: 0,
                                a: 0.05,
                              })}`
                            : `solid 2px ${GREEN}`,
                          borderTop: !isFormValid ? 0 : `solid 2px ${GREEN}`,
                          pt: !isFormValid ? 2 : 1.8,
                        },
                    }}
                    onClick={() => {
                      !isSaving && handleSubmit();
                    }}
                  >
                    <Iconify
                      icon={'material-symbols:save-outline'}
                      width={42}
                      sx={{
                        m: -2,
                        position: 'relative',
                        bottom: -6,
                        left: 8,
                      }}
                    />
                    <Stack spacing={2} sx={{ ml: 5, mt: -3 }}>
                      <Typography variant="subtitle2" noWrap>
                        SAVE NAME
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      margin: `0 -2px -2px 0`,
                      cursor: !isSaving && 'pointer',
                      color: !isSaving && 'black',
                      border: isSaving
                        ? `solid 2px ${IS_SAVING_HEX}`
                        : !isFormValid
                        ? `solid 2px ${getHexFromRGBAObject({
                            r: 255,
                            g: 0,
                            b: 0,
                            a: 0.2,
                          })}`
                        : `solid 2px ${LIGHT_RED}`,
                      borderLeft: isSaving
                        ? `solid 2px transparent`
                        : !isFormValid
                        ? `solid 2px ${getHexFromRGBAObject({
                            r: 255,
                            g: 0,
                            b: 0,
                            a: 0.2,
                          })}`
                        : `solid 2px ${LIGHT_RED}`,
                      borderTop: isSaving
                        ? `solid 2px transparent`
                        : !isFormValid
                        ? `solid 2px ${getHexFromRGBAObject({
                            r: 255,
                            g: 0,
                            b: 0,
                            a: 0.2,
                          })}`
                        : `solid 2px ${LIGHT_RED}`,
                      width: '60px',
                      borderBottomRightRadius: 12,
                      background: isSaving
                        ? 'transparent'
                        : !isFormValid
                        ? `rgba(255, 0, 0, 0.2)`
                        : LIGHT_RED,
                      '&:hover': !disableHover &&
                        !isSaving && {
                          background: LIGHT_RED,
                          border: `solid 2px ${RED}`,
                        },
                    }}
                    onClick={() =>
                      !isSaving && setOpenedSettingOption(undefined)
                    }
                  >
                    <Iconify
                      icon={'mdi:cancel-bold'}
                      width={42}
                      sx={{
                        m: -2,
                        position: 'relative',
                        bottom: -22,
                        right: -24,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        }}
      </Formik>
    </Box>
  );
}
