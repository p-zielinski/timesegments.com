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
import React from 'react';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../Form/Text';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { Checkbox } from '../Form/Checkbox';
import { styled } from '@mui/material/styles';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { handleFetch } from '../../../utils/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function EditSubcategory({
  controlValue,
  setControlValue,
  category,
  categories,
  setCategories,
  subcategory,
  setIsEditing,
  isSaving,
  setIsSaving,
  disableHover,
}) {
  const validationSchema = yup.object().shape({
    subcategoryName: yup.string().required('Subcategory name is required'),
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
  setStyledTextField(
    isSaving ? IS_SAVING_HEX : subcategory.color || category.color
  );

  const updateSubcategory = async (
    categoryName: string,
    color: string,
    inheritColor: boolean
  ) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'subcategory/update',
      body: {
        subcategoryId: subcategory.id,
        name: categoryName,
        color: inheritColor ? undefined : color,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === 201 && response?.subcategory) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            if (subcategory.id === response.subcategory.id) {
              return response.subcategory;
            }
            return subcategory;
          });
          return { ...category, subcategories };
        })
      );
      setIsEditing({
        categoryId: undefined,
        subcategoryId: undefined,
        createNew: undefined,
      });
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
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
        subcategoryName: subcategory.name,
        color: {
          hex: subcategory.color || category.color,
          rgb: getRgbaObjectFromHexString(subcategory.color || category.color),
        },
        inheritColor: !subcategory.color,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await updateSubcategory(
          values.subcategoryName,
          values.color.hex,
          values.inheritColor
        );
        setSubmitting(false);
      }}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, setFieldValue }) => {
        const isFormValid = validationSchema.isValidSync(values);

        return (
          <Card key={isSaving.toString()}>
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
                  <Stack spacing={2}>
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
                          if (isSaving) {
                            return;
                          }
                          setFieldValue('color', value);
                          setStyledTextField(value.hex);
                          setFieldValue(
                            'inheritColor',
                            value.hex === category.color
                          );
                        }}
                        color={values.color}
                        pointer={Picker}
                      />
                    </Box>
                    <Checkbox
                      label={'Inherit from category'}
                      name={'inheritColor'}
                      hideHelpText={true}
                      color={isSaving ? IS_SAVING_HEX : darkHexColor}
                      disabled={isSaving}
                      onChange={(e) => {
                        if (isSaving) {
                          return;
                        }
                        setFieldValue('inheritColor', e.target.checked);
                        if (e.target.checked) {
                          setFieldValue('color', {
                            hex: category.color,
                            rgb: getRgbaObjectFromHexString(category.color),
                          });
                          setStyledTextField(category.color);
                        }
                      }}
                    />
                    <InputText
                      type="text"
                      name="subcategoryName"
                      label="subcategory name"
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
                      SAVE SUBCATEGORY
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
                    '&:hover': !disableHover &&
                      !isSaving && {
                        background: LIGHT_RED,
                        border: `solid 2px ${RED}`,
                      },
                  }}
                  onClick={() =>
                    !isSaving &&
                    setIsEditing({
                      categoryId: undefined,
                      subcategoryId: undefined,
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
