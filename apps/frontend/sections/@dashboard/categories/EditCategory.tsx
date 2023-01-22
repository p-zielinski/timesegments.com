import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import { GREEN, LIGHT_GREEN, LIGHT_RED, RED } from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { SliderPicker } from 'react-color';
import Iconify from '../../../components/iconify';
import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../Form/Text';
import { getRgbaObjectFromHexString } from '../../../utils/getRgbaObjectFromHexString';
import { getHexFromRGBObject } from '../../../utils/getHexFromRGBObject';
import { getDarkColorBasedOnSliderPickerSchema } from '../../../utils/getDarkColorBasedOnSliderPickerSchema';
import { styled } from '@mui/material/styles';

export default function EditCategory({
  categories,
  setCategories,
  category,
  isEditing,
  setIsEditing,
  ...other
}) {
  function Picker() {
    return (
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          transform: 'translate(-8px, -3px)',
          backgroundColor: 'rgb(248, 248, 248)',
          boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)',
        }}
      />
    );
  }

  const validationSchema = yup.object().shape({
    categoryName: yup.string().required('Category name is required'),
  });

  let StyledTextField, darkHexColor;
  const setStyledTextField = (hexColor) => {
    darkHexColor = getHexFromRGBObject(
      getDarkColorBasedOnSliderPickerSchema(
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
  setStyledTextField(category.color);

  return (
    <Formik
      initialValues={{
        categoryName: category.name,
        color: {
          hex: category.color,
          rgb: getRgbaObjectFromHexString(category.color),
        },
      }}
      onSubmit={async (values, { setSubmitting }) => {
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
                  backgroundColor: 'rgba(0,0,0,0.11)',
                  cursor: 'auto',
                  minHeight: 54,
                  background: getRepeatingLinearGradient(
                    values.color?.hex,
                    0.3
                  ),
                  border: `solid 2px ${getHexFromRGBAObject({
                    ...values.color.rgb,
                    a: 0.3,
                  })}`,
                  borderBottom: '0px',
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Stack spacing={3}>
                    <SliderPicker
                      height={`8px`}
                      onChange={(value) => {
                        setFieldValue('color', value);
                        setFieldValue('color', value);
                        setStyledTextField(value.hex);
                        setCategories(
                          categories.map((_category) => {
                            if (_category.id !== category.id) {
                              return _category;
                            }
                            return { ..._category, color: value.hex };
                          })
                        );
                      }}
                      color={values.color}
                      pointer={Picker}
                    />
                    <InputText
                      type="text"
                      name="categoryName"
                      label="Category name"
                      TextField={StyledTextField}
                      helperTextColor={darkHexColor}
                    />
                  </Stack>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  background: !isFormValid
                    ? getRepeatingLinearGradient('000000', 0.05, 135)
                    : LIGHT_GREEN,
                  minHeight: 58,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  border: !isFormValid
                    ? `solid 2px ${getHexFromRGBAObject({
                        r: 0,
                        g: 0,
                        b: 0,
                        a: 0.05,
                      })}`
                    : `solid 2px ${LIGHT_GREEN}`,
                  borderTop: 0,
                  color: !isFormValid ? 'rgba(0,0,0,.2)' : 'black',
                  cursor: !isFormValid ? 'auto' : 'pointer',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    margin: `0 0 -2px -2px`,
                    border: !isFormValid
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
                    '&:hover': {
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
                    handleSubmit();
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
                      SAVE CATEGORY
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    margin: `0 -2px -2px 0`,
                    cursor: 'pointer',
                    color: 'black',
                    border: !isFormValid
                      ? `solid 2px ${getHexFromRGBAObject({
                          r: 255,
                          g: 0,
                          b: 0,
                          a: 0.2,
                        })}`
                      : `solid 2px ${LIGHT_RED}`,
                    width: '60px',
                    borderBottomRightRadius: 12,
                    background: !isFormValid
                      ? `rgba(255, 0, 0, 0.2)`
                      : LIGHT_RED,
                    '&:hover': {
                      background: LIGHT_RED,
                      border: `solid 2px ${RED}`,
                    },
                  }}
                  onClick={() =>
                    setIsEditing({
                      subcategoryId: undefined,
                      categoryId: undefined,
                      createNew: undefined,
                    })
                  }
                >
                  <Iconify
                    icon={'mdi:cancel-bold'}
                    width={42}
                    sx={{ m: -2, position: 'absolute', bottom: 26, right: 24 }}
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
