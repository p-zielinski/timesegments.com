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
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import Iconify from '../../../components/iconify';
import React, { useContext, useEffect } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import DateTimePicker from '../../../components/form/DateTimePicker';
import { SelectWithSearch } from '../../../components/form/SelectWithSearch';
import { styled } from '@mui/material/styles';
import { Timezones } from '@test1/shared';
import { DateTime } from 'luxon';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { StoreContext } from '../../../hooks/useStore';
import { useStore } from 'zustand';

export default function AddTimeLog({}) {
  const store = useContext(StoreContext);
  const {
    timeLogs,
    setTimeLogs,
    user,
    controlValues,
    setControlValues,
    disableHover,
    isEditing,
    setIsEditing,
    isSaving,
    setIsSaving,
    categories,
    handleIncorrectControlValues,
  } = useStore(store);

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
          color: error ? '#FF4842' : darkHexColor,
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
            borderColor: error ? '#FF4842' : focused ? darkHexColor : hexColor,
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

  const getValidationSchema = () => {
    const activeCategories = categories.filter((category) => category.active);
    return yup.object().shape({
      categoryId: yup
        .string()
        .nullable()
        .test(
          'Category',
          ({ value }) => {
            if (!value) {
              return 'Category is required';
            }
            return 'You cannot create unfinished timelog with already active category';
          },
          (value, context) => {
            if (!value) {
              return false;
            }
            const { finished } = context.parent;
            if (finished) {
              return true;
            }
            return !(
              !!value &&
              activeCategories.find(
                (activeCategory) => activeCategory.id === value
              )
            );
          }
        ),
      startDateTime: yup
        .string()
        .nullable()
        .test({
          name: 'Start date time',
          exclusive: false,
          message: ({ value, originalValue }) => {
            if (!value) {
              return 'Start date time is required';
            }
            if (value === 'Invalid DateTime' || !originalValue?.toMillis()) {
              return 'Valid start date time is required';
            }
            if (
              !originalValue?.toMillis() ||
              DateTime.now().toMillis() - originalValue.toMillis() < 0
            ) {
              return 'Start date time must be earlier than now';
            }
          },
          test: (value) => {
            if (!value || value === 'Invalid DateTime') {
              return false;
            }
            const startDateTime = DateTime.fromISO(value, {
              zone: Timezones[user.timezone],
            });
            return !(
              !startDateTime.toMillis() ||
              DateTime.now().toMillis() - startDateTime.toMillis() < 0
            );
          },
        }),
      endDateTime: yup
        .string()
        .nullable()
        .test({
          name: 'End date time',
          exclusive: false,
          message: ({ value, originalValue }) => {
            if (!value) {
              return 'Start date time is required';
            }
            if (value === 'Invalid DateTime' || !originalValue?.toMillis()) {
              return 'Valid start date time is required';
            }
            if (
              originalValue?.toMillis() ||
              DateTime.now().toMillis() - originalValue.toMillis() < 0
            ) {
              return 'End date time must be later than start date time';
            }
          },
          test: (value, context) => {
            const { finished, startDateTime: rawStartDateTime } =
              context.parent;
            if (!finished) {
              return true;
            }
            if (!value || value === 'Invalid DateTime') {
              return false;
            }
            const endDateTime = DateTime.fromISO(value, {
              zone: Timezones[user.timezone],
            });
            if (
              !endDateTime.toMillis() ||
              DateTime.now().toMillis() - endDateTime.toMillis() <= 0
            ) {
              return false;
            }
            if (!rawStartDateTime || rawStartDateTime === 'Invalid DateTime') {
              return true;
            }
            const startDateTime = DateTime.fromISO(rawStartDateTime, {
              zone: Timezones[user.timezone],
            });
            if (!startDateTime?.toMillis()) {
              return true;
            }
            return endDateTime.toMillis() - startDateTime.toMillis() > 0;
          },
        }),
    });
  };

  const createTimeLog = async (
    categoryId: string,
    startDateTime: DateTime,
    endDateTime?: DateTime
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'time-log/create',
      body: {
        categoryId,
        from: startDateTime.toMillis(),
        to: endDateTime?.toMillis(),
        controlValues,
      },
      method: 'POST',
    });
    if (
      response.statusCode === StatusCodes.CREATED &&
      response?.timeLog instanceof Object
    ) {
      setTimeLogs([...timeLogs, response.timeLog]);
    } else if (
      response.statusCode === StatusCodes.CONFLICT &&
      response.typesOfControlValuesWithIncorrectValues?.length > 0
    ) {
      handleIncorrectControlValues(
        response.typesOfControlValuesWithIncorrectValues
      );
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  return (
    <Formik
      initialValues={{
        finished: false,
        categoryId: '',
        startDateTime: undefined,
        endDateTime: undefined,
        endDateTimeHidden: undefined,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await createTimeLog(
          values.categoryId,
          values.startDateTime,
          values.endDateTime
        );
        setSubmitting(false);
      }}
      validationSchema={getValidationSchema}
    >
      {({
        handleSubmit,
        values,
        setFieldValue,
        errors,
        setErrors,
        setFieldTouched,
      }) => {
        const isFormValid = getValidationSchema().isValidSync(values);

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
          if (!values.finished && values.endDateTime) {
            setFieldValue('endDateTimeHidden', values.endDateTime);
            setFieldValue('endDateTime', '');
          } else if (values.finished && values.endDateTimeHidden) {
            setFieldValue('endDateTime', values.endDateTimeHidden);
          }
        }, [values.categoryId, values.finished]);

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
                <Box sx={{ p: 1.5, mt: 1 }}>
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
                  <Stack spacing={1} key={values.categoryId}>
                    <Box>
                      <SelectWithSearch
                        key={darkHexColor}
                        name="categoryId"
                        label="Category"
                        options={categories.map((category) => {
                          return { label: category.name, value: category.id };
                        })}
                        TextField={styled(TextField)(
                          getTextFieldProps(!!errors?.categoryId, false)
                        )}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving}
                      />
                    </Box>
                    <DateTimePicker
                      name="startDateTime"
                      label="Start date time"
                      getTextFieldProps={getTextFieldProps}
                      helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}
                      disabled={isSaving}
                      timezone={Timezones[user.timezone]}
                    />
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
                      <DateTimePicker
                        name="endDateTime"
                        label={
                          values.finished ? 'End date time' : 'Not finished'
                        }
                        getTextFieldProps={getTextFieldProps}
                        helperTextColor={
                          isSaving ? IS_SAVING_HEX : darkHexColor
                        }
                        disabled={isSaving || !values.finished}
                        timezone={Timezones[user.timezone]}
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
                  onClick={() => !isSaving && isFormValid && handleSubmit()}
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
                  onClick={() => setFieldValue('finished', !values.finished)}
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
