import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import {
  GREEN,
  IS_SAVING_HEX,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { SliderPicker } from 'react-color';
import Iconify from '../../../components/iconify';
import React, { useState } from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../Form/Text';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { styled } from '@mui/material/styles';
import { handleFetch } from '../../../utils/handleFetch';

export default function EditCategory({
  controlValue,
  setControlValue,
  categories,
  setCategories,
  category,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
}) {
  const [staticCategory, setStaticCategory] = useState(category);

  const validationSchema = yup.object().shape({
    categoryName: yup.string().required('Category name is required'),
  });

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
  setStyledTextField(isSaving ? IS_SAVING_HEX : category.color);

  const updateCategory = async (categoryName: string, color: string) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/update',
      body: { categoryId: category.id, name: categoryName, color },
      method: 'POST',
    });
    if (response.statusCode === 201 && response?.category) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            subcategory.active = false;
            return subcategory;
          });
          if (category.id === response.category?.id) {
            const updatedCategory = { ...response.category, subcategories };
            setStaticCategory(updatedCategory);
            return updatedCategory;
          }
          return { ...category, active: false, subcategories };
        })
      );
      setIsEditing({
        subcategoryId: undefined,
        categoryId: undefined,
        createNew: undefined,
      });
    }
    setIsSaving(false);
    return;
  };

  function Picker() {
    return (
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          transform: 'translate(-8px, -3px)',
          backgroundColor: isSaving ? IS_SAVING_HEX : 'rgb(248, 248, 248)',
          boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)',
        }}
      />
    );
  }

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
        await updateCategory(values.categoryName, values.color.hex);
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
                    isSaving ? IS_SAVING_HEX : values.color?.hex,
                    0.3,
                    45,
                    false
                  ),
                  border: `solid 2px ${
                    isSaving
                      ? IS_SAVING_HEX
                      : getHexFromRGBAObject({
                          ...values.color.rgb,
                          a: 0.3,
                        })
                  }`,
                  borderBottom: '0px',
                }}
              >
                <Box sx={{ p: 2 }}>
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
                    </Box>
                    <InputText
                      type="text"
                      name="categoryName"
                      label="Category name"
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
                    '&:hover': !isSaving && {
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
                      SAVE CATEGORY
                    </Typography>
                  </Stack>
                </Box>
                <Box
                  sx={{
                    margin: `0 -2px -2px 0`,
                    cursor: !isSaving && 'pointer',
                    color: isSaving ? IS_SAVING_HEX : 'black',
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
                    '&:hover': !isSaving && {
                      background: LIGHT_RED,
                      border: `solid 2px ${RED}`,
                    },
                  }}
                  onClick={() => {
                    if (isSaving) {
                      return;
                    }
                    setCategories(
                      categories.map((_category) => {
                        if (_category.id !== category.id) {
                          return _category;
                        }
                        return staticCategory;
                      })
                    );
                    setIsEditing({
                      subcategoryId: undefined,
                      categoryId: undefined,
                      createNew: undefined,
                    });
                  }}
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
