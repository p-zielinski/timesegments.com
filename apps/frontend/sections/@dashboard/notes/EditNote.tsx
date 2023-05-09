import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { styled } from '@mui/material/styles';
import { StatusCodes } from 'http-status-codes';
import { handleFetch } from '../../../utils/handleFetch';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import Iconify from '../../../components/iconify';
import InputText from '../../../components/form/Text';
import { Checkbox } from '../Form/Checkbox';
import { useRouter } from 'next/router';

export default function EditNote({
  controlValue,
  setControlValue,
  note,
  userNotes,
  setUserNotes,
  disableHover,
  isSaving,
  setIsSaving,
  setEditing,
  color,
}) {
  const router = useRouter();
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

  const initialValues = {
    note: note.note,
    favorite: note.favorite,
  };

  const updateNote = async (
    noteId: string,
    note: string,
    favorite: boolean
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'note/update',
      body: {
        noteId,
        note,
        favorite,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response.note) {
      setUserNotes(
        userNotes.map((currentNote) => {
          if (currentNote.id === noteId) {
            return response.note;
          }
          return currentNote;
        })
      );
      setEditing({
        isEditing: undefined,
        isDeleting: false,
      });
      if (response.cotrolValue) {
        setControlValue(response.cotrolValue);
      }
    } else if (response.statusCode === StatusCodes.UNAUTHORIZED) {
      return router.push('/');
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined); //skip setting isSaving(false)
      return;
    }
    setIsSaving(false);
    return;
  };

  const validationSchema = yup.object().shape({
    note: yup.string().required(),
  });

  return (
    <Card>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, { setSubmitting }) => {
          await updateNote(note.id, values.note, values.favorite);
          setSubmitting(false);
        }}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, values, setFieldValue }) => {
          const isFormValid = validationSchema.isValidSync(values);

          return (
            <Card>
              <Box>
                <Box
                  sx={{
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    cursor: 'auto',
                    minHeight: 54,
                    background: getRepeatingLinearGradient(
                      isSaving ? IS_SAVING_HEX : color.hex,
                      0.2,
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
                    borderBottom: '0px',
                  }}
                >
                  <Box sx={{ p: 2, pt: 3.5, pb: 1.5 }}>
                    {isSaving && (
                      <Box
                        sx={{
                          width: 'calc(100% + 20px)',
                          height: 'calc(100% + 20px)',
                          background: 'transparent',
                          position: 'absolute',
                          zIndex: 1,
                          transform: 'translate(-20px, -20px)',
                        }}
                      />
                    )}
                    <InputText
                      type="text"
                      rows={3}
                      multiline={true}
                      name={'note'}
                      label={`Note`}
                      TextField={StyledTextField}
                      helperTextColor={isSaving ? IS_SAVING_HEX : darkHexColor}
                      disabled={isSaving}
                      inputBackground={getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(
                          isSaving ? IS_SAVING_HEX : color.hex
                        ),
                        a: 0.03,
                      })}
                    />
                    <Box sx={{ ml: 1, mb: 0.5 }}>
                      <Checkbox
                        label={'Favorite'}
                        name={'favorite'}
                        hideHelpText={true}
                        color={darkHexColor}
                        onChange={(e) => {
                          setFieldValue('favorite', e.target.checked);
                        }}
                      />
                    </Box>
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
                        position: 'absolute',
                        bottom: 25,
                        left: 25,
                      }}
                    />
                    <Stack spacing={2} sx={{ ml: 5 }}>
                      <Typography variant="subtitle2" noWrap>
                        SAVE NOTE FOR LATER
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
                    onClick={() => !isSaving && setEditing('')}
                  >
                    <Iconify
                      icon={'mdi:cancel-bold'}
                      width={42}
                      sx={{
                        m: -2,
                        position: 'absolute',
                        bottom: 26,
                        right: 24,
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
