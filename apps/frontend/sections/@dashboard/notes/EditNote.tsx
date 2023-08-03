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
import { getRandomRgbObjectForSliderPicker } from '../../../utils/colors/getRandomRgbObjectForSliderPicker';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../../../components/form/Text';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function EditNote({ category, useStore }) {
  const {
    router,
    note,
    controlValue,
    setPartialControlValues,
    disableHover,
    isSaving,
    setIsSaving,
    setIsEditing,
    categories,
    setCategories,
    handleIncorrectControlValues,
  } = useStore();

  const color = category?.color
    ? {
        hex: category.color,
        rgb: getRgbaObjectFromHexString(category.color),
      }
    : getRandomRgbObjectForSliderPicker();

  let StyledTextField, darkHexColor;
  const setStyledTextField = (isSaving, hexColor) => {
    darkHexColor = getHexFromRGBObject(
      getColorShadeBasedOnSliderPickerSchema(
        getRgbaObjectFromHexString(isSaving ? IS_SAVING_HEX : hexColor)
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
          borderColor: isSaving
            ? IS_SAVING_HEX
            : getHexFromRGBAObject({
                ...getRgbaObjectFromHexString(hexColor),
                a: 0.3,
              }),
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
  setStyledTextField(isSaving, category.color);

  const updateNote = async (text: string, noteId: string) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'note/update',
      body: { text, noteId },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response.note) {
      setCategories(
        categories.map((category_) => {
          if (category_.id !== category.id) {
            return category_;
          }
          return {
            ...category,
            notes: (category.notes || []).map((note_) => {
              if (note_.id !== response.note?.id) {
                return note_;
              }
              return response.note;
            }),
          };
        })
      );
      if (response.partialControlValues) {
        setPartialControlValues(response.partialControlValues);
      }
      setIsEditing({});
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      return router.push('/');
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

  const deleteNote = async (noteId) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'note/delete',
      body: {
        noteId,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setCategories(
        categories.map((category_) => {
          if (category_.id !== category.id) {
            return category_;
          }
          return {
            ...category,
            notes: (category.notes || []).filter(
              (note_) => note_.id !== response.note?.id
            ),
          };
        })
      );
      if (response.partialControlValues) {
        setPartialControlValues(response.partialControlValues);
      }
      setIsEditing({});
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      return router.push('/');
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

  const validationSchema = yup.object().shape({
    text: yup
      .string()
      .required('Text is required')
      .max(1000, 'Text cannot be longer than 1000 characters'),
  });

  return (
    <Formik
      initialValues={{
        text: note.text,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await updateNote(values.text, note?.id);
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
                  minHeight: 54,
                  background: backgroundColor,
                  border: `solid 1px ${backgroundColor}`,
                  borderBottom: '0px',
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
                <Box sx={{ p: 1.5, pb: 0 }}>
                  <InputText
                    type="text"
                    rows={4}
                    multiline={true}
                    name={'text'}
                    label={`Note`}
                    TextField={StyledTextField}
                    helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}
                    disabled={isSaving}
                  />
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
                      isFormValid &&
                      !disableHover && {
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
                      icon={'ic:outline-note-add'}
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
                        SAVE NOTE
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
                  onClick={() => !isSaving && deleteNote(note.id)}
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
                    '&:hover': !isSaving &&
                      !disableHover && {
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
