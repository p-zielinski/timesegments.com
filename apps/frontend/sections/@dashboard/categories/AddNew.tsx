import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import {
  BLUE,
  GREEN,
  IS_SAVING_HEX,
  LIGHT_BLUE,
  LIGHT_GREEN,
  LIGHT_RED,
  RED,
  SUPER_LIGHT_SILVER,
} from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { SliderPicker } from 'react-color';
import Iconify from '../../../components/iconify';
import React from 'react';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/colors/getRandomRgbObjectForSliderPicker';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../../../components/form/Text';
import { CreateNewType } from '../../../enum/createNewType';
import capitalize from 'capitalize';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { styled } from '@mui/material/styles';
import { Checkbox } from '../Form/Checkbox';
import { handleFetch } from '../../../utils/fetchingData/handleFetch';
import { StatusCodes } from 'http-status-codes';

export default function AddNew({
  controlValue,
  setControlValue,
  disableHover,
  type,
  data = {},
  isEditing,
  setIsEditing,
  category,
  isSaving,
  setIsSaving,
  categories,
  setCategories,
}) {
  const startingColor = category?.color
    ? {
        hex: category.color,
        rgb: getRgbaObjectFromHexString(category.color),
      }
    : getRandomRgbObjectForSliderPicker();

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
  setStyledTextField(isSaving ? IS_SAVING_HEX : startingColor.hex);

  const createCategory = async (name: string, color: string) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/create',
      body: { name, color, controlValue },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories([{ ...response.category }, ...categories]);
      setIsEditing({
        categoryId: undefined,
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

  if (
    isEditing?.createNew !==
    `${type}${category?.id ? `4categoryId:${category.id}` : ''}`
  ) {
    return (
      <Card
        sx={{
          p: 2,
          cursor: !isSaving && 'pointer',
          minHeight: 54,
          color: isSaving && IS_SAVING_HEX,
          background: isSaving
            ? SUPER_LIGHT_SILVER
            : type === CreateNewType.CATEGORY
            ? LIGHT_GREEN
            : LIGHT_BLUE,
          border: `solid 2px  ${
            isSaving
              ? IS_SAVING_HEX
              : type === CreateNewType.CATEGORY
              ? LIGHT_GREEN
              : LIGHT_BLUE
          }`,
          '&:hover': !disableHover &&
            !isSaving && {
              border: `solid 2px  ${
                type === CreateNewType.CATEGORY ? GREEN : BLUE
              }`,
            },
        }}
        onClick={() =>
          !isSaving &&
          setIsEditing({
            categoryId: undefined,
            createNew: `${type}${
              category?.id ? `4categoryId:${category.id}` : ''
            }`,
          })
        }
      >
        <Iconify
          icon={'material-symbols:add'}
          width={50}
          sx={{
            m: -2,
            position: 'absolute',
            bottom: 18,
            left: 20,
          }}
        />
        <Stack spacing={2} sx={{ ml: 5 }}>
          <Typography variant="subtitle2" noWrap>
            CREATE NEW {type?.toUpperCase()}
          </Typography>
        </Stack>
      </Card>
    );
  }

  const validationSchema = yup.object().shape({
    [type + 'Name']: yup.string().required('Category name is required'),
  });

  return (
    <Formik
      initialValues={{
        ...data,
        [type + 'Name']: '',
        inheritColor: category?.id ? true : undefined,
        color: startingColor,
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await createCategory(values?.[type + 'Name'], values.color.hex);
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
                          ...(values.color.rgb as {
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
                          setFieldValue('color', value);
                          setStyledTextField(value.hex);
                          if (category) {
                            setFieldValue(
                              'inheritColor',
                              value.hex === category.color
                            );
                          }
                        }}
                        color={values.color}
                        pointer={Picker}
                      />
                    </Box>
                    {category && (
                      <Checkbox
                        label={'Inherit from category'}
                        name={'inheritColor'}
                        hideHelpText={true}
                        color={darkHexColor}
                        onChange={(e) => {
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
                    )}
                    <InputText
                      type="text"
                      name={`${type}Name`}
                      label={`${capitalize(type)} name`}
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
                    icon={'material-symbols:add'}
                    width={50}
                    sx={{
                      m: -2,
                      position: 'absolute',
                      bottom: 21,
                      left: 22,
                    }}
                  />
                  <Stack spacing={2} sx={{ ml: 5 }}>
                    <Typography variant="subtitle2" noWrap>
                      CREATE NEW {type?.toUpperCase()}
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
                    !isSaving &&
                    setIsEditing({
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
