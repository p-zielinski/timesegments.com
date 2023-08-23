import {
  Box,
  Card,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DARK_GREEN,
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
import { styled } from '@mui/material/styles';
import { Timezones } from '@test1/shared';
import { DateTime } from 'luxon';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';
import { StoreContext } from '../../../hooks/useStore';
import { useStore } from 'zustand';
import { TimeLog } from '@prisma/client';

export default function EditTimeLog({ timeLog }: { timeLog: TimeLog }) {
  const store = useContext(StoreContext);
  const {
    timeLogs,
    setTimeLogs,
    user,
    controlValues,
    setIsEditing,
    isSaving,
    setIsSaving,
    categories,
    setCategories,
    handleIncorrectControlValues,
    setPartialControlValues,
  } = useStore(store);

  const color = categories.find(
    (category) => category.id === timeLog.categoryId
  )?.color;

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
  setStyledTextField(isSaving, color);

  const getValidationSchema = () => {
    const activeCategories = categories.filter((category) => category.active);
    return yup.object().shape({
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

  const editTimeLog = async (
    startDateTime: DateTime,
    endDateTime?: DateTime
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'time-log/edit',
      body: {
        timeLogId: timeLog.id,
        from: startDateTime.toMillis(),
        to: endDateTime?.toMillis(),
        controlValues,
      },
      method: 'POST',
    });
    if (
      response.statusCode === StatusCodes.CREATED &&
      response.partialControlValues
    ) {
      setPartialControlValues(response.partialControlValues);
    }
    if (
      response.statusCode === StatusCodes.CREATED &&
      response?.timeLog instanceof Object
    ) {
      setTimeLogs([
        ...timeLogs.filter((timeLog) => timeLog.id !== response.timeLog),
        response.timeLog,
      ]);
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
    setIsEditing({});
    return;
  };

  const deleteTimeLog = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'time-log/delete',
      body: {
        timeLogId: timeLog.id,
        controlValues,
      },
      method: 'POST',
    });
    if (
      response.statusCode === StatusCodes.CREATED &&
      response.partialControlValues
    ) {
      setPartialControlValues(response.partialControlValues);
    }
    if (
      response.statusCode === StatusCodes.CREATED &&
      response?.deletedTimeLog instanceof Object &&
      response?.category instanceof Object
    ) {
      setTimeLogs(
        timeLogs.filter((timeLog) => timeLog.id !== response.deletedTimeLog.id)
      );
      setCategories([
        ...categories.filter(
          (category) => category.id !== response.category.id
        ),
        response.category,
      ]);
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
    setIsEditing({});
    return;
  };

  return (
    <Formik
      initialValues={{
        finished: !!timeLog.endedAt,
        startDateTime: DateTime.fromISO(timeLog.startedAt.toString()),
        endDateTime: timeLog.endedAt
          ? DateTime.fromISO(timeLog.endedAt.toString())
          : undefined,
        endDateTimeHidden: undefined,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await editTimeLog(values.startDateTime, values.endDateTime);
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
                        (category) => category.id === timeLog.categoryId
                      )?.color
                    ),
                    'bright'
                  )
                ),
            0.2
          )
        );

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (!values.finished && values.endDateTime) {
            setFieldValue('endDateTimeHidden', values.endDateTime);
            setFieldValue('endDateTime', '');
          } else if (values.finished && values.endDateTimeHidden) {
            setFieldValue('endDateTime', values.endDateTimeHidden);
          }
        }, [values.finished]);

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
                  <Stack spacing={1}>
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
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        onClick={() =>
                          setFieldValue('finished', !values.finished)
                        }
                        sx={{
                          display: 'flex',
                          cursor: 'pointer',
                          pl: 1,
                          pr: 1,
                          mt: -1,
                          mb: -1,
                        }}
                      >
                        <Checkbox
                          checked={!!values.finished}
                          sx={{
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
                        <Stack
                          sx={{
                            position: 'relative',
                            pt: 1.2,
                            pl: 0.5,
                            color: DARK_GREEN,
                          }}
                        >
                          <Typography variant="subtitle2" noWrap>
                            Finished
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        background: isSaving
                          ? SUPER_LIGHT_SILVER
                          : backgroundColor,
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
                    ></Box>
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
                        SAVE TIME LOG
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED,
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
                  onClick={() => !isSaving && deleteTimeLog()}
                >
                  <Iconify
                    icon={'material-symbols:delete-forever-outline-rounded'}
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
