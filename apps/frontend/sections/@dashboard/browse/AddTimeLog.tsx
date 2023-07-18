import {
  Box,
  Card,
  Checkbox,
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
import { DateTime } from 'luxon';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import Iconify from '../../../components/iconify';
import React, { useEffect } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import DatePicker from '../../../components/form/DatePicker';
import { SelectWithSearch } from '../../../components/form/SelectWithSearch';
import { styled } from '@mui/material/styles';
import { Timezones } from '@test1/shared';
import { TimePicker } from '../../../components/form/TimePicker';

export default function AddTimeLog({
  user,
  controlValue,
  setControlValue,
  disableHover,
  data = {},
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  categories,
}) {
  const startingColor = {
    hex: '#bf8940',
    rgb: { r: 191, g: 137, b: 64, a: 1 },
  }; //getRandomRgbObjectForSliderPicker();

  let getTextFieldProps: (error, focused) => Record<string, any>,
    StyledTextField,
    darkHexColor;
  const setStyledTextField = (isSaving, hexColor) => {
    darkHexColor = getHexFromRGBObject(
      getColorShadeBasedOnSliderPickerSchema(
        getRgbaObjectFromHexString(isSaving ? IS_SAVING_HEX : hexColor)
      )
    );
    getTextFieldProps = (error, focused) => {
      return {
        background: 'white',
        borderRadius: '8px',
        '& input': {
          color: darkHexColor,
          backgroundColor: 'white',
          borderRadius: '6px',
        },
        '& label.Mui-focused': {
          color: darkHexColor,
        },
        '& label': {
          color: error ? '#FF4842' : darkHexColor,
          backgroundColor: 'rgba(255,255,255,.5)',
          borderRadius: '6px',
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: hexColor,
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: isSaving
              ? IS_SAVING_HEX
              : error
              ? '#FF4842'
              : focused
              ? darkHexColor
              : getHexFromRGBAObject({
                  ...getRgbaObjectFromHexString(hexColor),
                  a: 0.3,
                }),
          },
          '&:hover fieldset': {
            borderColor: focused ? darkHexColor : hexColor,
          },
          '&.Mui-focused fieldset': {
            borderColor: hexColor,
            border: `1px solid ${darkHexColor}`,
          },
        },
      };
    };
    StyledTextField = styled(TextField)(getTextFieldProps(false, false));
  };
  setStyledTextField(isSaving, startingColor.hex);

  if (!isEditing.createNew) {
    return (
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'row',
          cursor: !isSaving && 'pointer',
          color: isSaving && IS_SAVING_HEX,
          border: `solid 1px ${isSaving ? IS_SAVING_HEX : LIGHT_GREEN}`,
          background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_GREEN,
          '&:hover': !disableHover &&
            !isSaving && {
              border: `solid 1px ${GREEN}`,
            },
        }}
        onClick={() => setIsEditing({ createNew: true })}
      >
        <Box>
          <Iconify
            icon={'material-symbols:add'}
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
              ADD NEW TIMELOG
            </Typography>
          </Stack>
        </Box>
      </Card>
    );
  }

  const validationSchema = yup.object().shape({
    categoryId: yup.string().required('Category is required').min(1),
    startDate: yup.string().required('Start date is required').min(1),
    startTime: yup.string().required('Start time is required').min(1),
    endDate: yup.string().required('End date is required').min(1),
    endTime: yup.string().required('End time is required').min(1),
  });

  return (
    <Formik
      initialValues={{
        ...data,
        finished: false,
        categoryId: '',
        startDate: DateTime.now(),
        startTime: '',
        endDate: '',
        endTime: '',
        endDateHidden: '',
        endTimeHidden: '',
      }}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(false);
      }}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, setFieldValue, touched }) => {
        const isFormValid = validationSchema.isValidSync(values);

        const backgroundColor = getHexFromRGBAObject(
          getRgbaObjectFromHexString(
            isSaving
              ? IS_SAVING_HEX
              : getHexFromRGBAObject(
                  getColorShadeBasedOnSliderPickerSchema(
                    getRgbaObjectFromHexString(
                      categories.find(
                        (category) => category.id === values.categoryId
                      )?.color || startingColor.hex
                    ),
                    'bright'
                  )
                ),
            0.2
          )
        );

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          setStyledTextField(
            isSaving,
            categories.find((category) => category.id === values.categoryId)
              ?.color || startingColor.hex
          );
        }, [values.categoryId]);

        return (
          <Card>
            <Box>
              <Box
                sx={{
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  cursor: 'auto',
                  minHeight: 54,
                  background: backgroundColor,
                  border: `solid 1px ${backgroundColor}`,
                  borderBottom: '0px',
                }}
              >
                <Box sx={{ p: 1.5 }}>
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
                  <Stack spacing={1}>
                    <Box>
                      <SelectWithSearch
                        key={darkHexColor}
                        name="categoryId"
                        label="Category"
                        options={categories.map((category) => {
                          return { label: category.name, value: category.id };
                        })}
                        TextField={StyledTextField}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                      <DatePicker
                        name="startDate"
                        label="Start date"
                        getTextFieldProps={getTextFieldProps}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving}
                        timezone={Timezones[user.timezone]}
                        initialFocused={true}
                      />
                      <TimePicker
                        name="startTime"
                        label="Start time"
                        getTextFieldProps={getTextFieldProps}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                      {(isSaving || !values.finished) && (
                        <Box
                          sx={{
                            width: 'calc(100% + 20px)',
                            height: '70px',
                            background: 'transparent',
                            position: 'absolute',
                            zIndex: 1,
                            transform: 'translate(-10px, -10px)',
                          }}
                        />
                      )}
                      <DatePicker
                        name="endDate"
                        label={values.finished ? 'End date' : 'Not finished'}
                        getTextFieldProps={getTextFieldProps}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving || !values.finished}
                        timezone={Timezones[user.timezone]}
                      />
                      <TimePicker
                        name="endTime"
                        label={values.finished ? 'End time' : 'Not finished'}
                        getTextFieldProps={getTextFieldProps}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving || !values.finished}
                      />
                    </Box>
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
                        CREATE TIME LOG
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    background: isSaving ? SUPER_LIGHT_SILVER : backgroundColor,
                    pl: '5px',
                    pr: '5px',
                    border: `solid 1px ${
                      isSaving ? SUPER_LIGHT_SILVER : backgroundColor
                    }`,
                    color: isSaving ? IS_SAVING_HEX : 'black',
                    cursor: isSaving ? 'default' : 'pointer',
                    '&:hover': !isSaving && {
                      background: backgroundColor,
                    },
                  }}
                  onClick={() => !isSaving && undefined}
                >
                  <Checkbox
                    checked={!!values.finished}
                    sx={{
                      position: 'relative',
                      top: '50%',
                      left: '40%',
                      transform: 'translate(-40%, -50%)',
                      p: 0,
                      '&:hover': { background: 'transparent' },
                      color: GREEN,
                      '&.Mui-checked': {
                        color: GREEN,
                      },
                      '& .MuiSvgIcon-root': { fontSize: 40 },
                      '.Mui-focusVisible &': {
                        outline: '2px auto rgba(19,124,189,.6)',
                        outlineOffset: 2,
                      },
                    }}
                    onClick={() => {
                      setFieldValue('finished', !values.finished);
                      if (values.finished) {
                        setFieldValue('endDateHidden', values.endDate);
                        setFieldValue('endTimeHidden', values.endTime);
                        setFieldValue('endDate', '');
                        setFieldValue('endTime', '');
                      } else {
                        setFieldValue('endDate', values.endDateHidden);
                        setFieldValue('endTime', values.endTimeHidden);
                      }
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    width: '16px',
                    background:
                      !isFormValid || isSaving
                        ? SUPER_LIGHT_SILVER
                        : LIGHT_GREEN,
                    border: `solid 1px ${
                      isSaving || !isFormValid
                        ? SUPER_LIGHT_SILVER
                        : LIGHT_GREEN
                    }`,
                  }}
                />
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
                    setIsEditing({});
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
  );
}
