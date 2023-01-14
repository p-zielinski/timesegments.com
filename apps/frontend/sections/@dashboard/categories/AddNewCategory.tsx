import { Box, Card, Stack, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import { GREEN, LIGHT_GREEN, LIGHT_RED, RED } from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { SliderPicker } from 'react-color';
import TextField from '@mui/material/TextField';
import Iconify from '../../../components/iconify';
import React, { useEffect, useState } from 'react';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/getRandomRgbObjectForSliderPicker';
import { Rgba } from '../../../type/user';
import * as yup from 'yup';
import { Formik } from 'formik';
import { InputText } from '../Form/Text';

export default function AddNewCategory({
  categories,
  setCategories,
  isEditing,
  ...other
}) {
  const [openCreateNewCategoryMenu, setOpenCreateNewCategoryMenu] =
    useState(false);
  const [color, setColor] = useState(getRandomRgbObjectForSliderPicker());

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

  if (!openCreateNewCategoryMenu) {
    return (
      <Card
        sx={{
          p: 2,
          cursor: 'pointer',
          minHeight: 54,
          background: LIGHT_GREEN,
          border: `solid 2px  ${LIGHT_GREEN}`,
          '&:hover': {
            border: `solid 2px  ${GREEN}`,
          },
        }}
        onClick={() => setOpenCreateNewCategoryMenu(true)}
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
            CREATE NEW CATEGORY
          </Typography>
        </Stack>
      </Card>
    );
  }

  const validationSchema = yup.object().shape({
    categoryName: yup.string().required('Category name is required'),
  });

  return (
    <Formik
      initialValues={{ categoryName: '' }}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(false);
      }}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values }) => {
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
                  background: getRepeatingLinearGradient(color?.hex, 0.3),
                  border: `solid 2px ${getHexFromRGBAObject({
                    ...(color.rgb as Rgba),
                    a: 0.3,
                  })}`,
                  borderBottom: '0px',
                }}
                onClick={() => {
                  if (!openCreateNewCategoryMenu) {
                    setOpenCreateNewCategoryMenu(true);
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <SliderPicker
                      height={`8px`}
                      onChangeComplete={setColor}
                      onChange={setColor}
                      color={color}
                      pointer={Picker}
                    />
                    <InputText
                      type="text"
                      name="categoryName"
                      label="Category name"
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
                      CREATE NEW CATEGORY
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
                  onClick={() => setOpenCreateNewCategoryMenu(false)}
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
