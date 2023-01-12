import { Box, Card, Stack, Typography } from '@mui/material';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';
import { GREEN, LIGHT_GREEN } from '../../../consts/colors';
import { getHexFromRGBAObject } from '../../../utils/getHexFromRGBAObject';
import { SliderPicker } from 'react-color';
import TextField from '@mui/material/TextField';
import Iconify from '../../../components/iconify';
import React, { useState } from 'react';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/getRandomRgbObjectForSliderPicker';
import { Rgba } from '../../../type/user';

export default function AddNewCategory({
  categories,
  setCategories,
  isEditing,
  setIsEditing,
  ...other
}) {
  const [openCreateNewCategoryMenu, setOpenCreateNewCategoryMenu] =
    useState(true);
  const [backgroundHue, setBackgroundHue] = useState(
    getRandomRgbObjectForSliderPicker()
  );
  const [inputValue, setInputValue] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(!inputValue);
  const [isInputTouched, setIsInputTouched] = useState(false);

  function handleCreateNewCategory() {
    return;
  }

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
            ADD NEW CATEGORY
          </Typography>
        </Stack>
      </Card>
    );
  }

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
            background: getRepeatingLinearGradient(backgroundHue?.hex, 0.3),
            border: `solid 2px ${getHexFromRGBAObject({
              ...(backgroundHue.rgb as Rgba),
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
                onChangeComplete={setBackgroundHue}
                onChange={setBackgroundHue}
                color={backgroundHue}
                pointer={Picker}
              />
              <TextField
                sx={{
                  mt: 4,
                  background: `rgba(255, 255, 255, 0.8)`,
                  borderRadius: 1,
                }}
                size={'small'}
                error={false}
                id="outlined-error"
                label="Category name"
              />
            </Stack>
          </Box>
        </Box>
        <Box
          onClick={() => {
            if (isButtonDisabled) {
              return setIsInputTouched(true);
            }
            handleCreateNewCategory();
          }}
          sx={{
            width: '100%',
            background: isButtonDisabled
              ? getRepeatingLinearGradient('000000', 0.05, 135)
              : LIGHT_GREEN,
            minHeight: 56,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            p: 2,
            border: isButtonDisabled
              ? `solid 2px ${getHexFromRGBAObject({
                  r: 0,
                  g: 0,
                  b: 0,
                  a: 0.05,
                })}`
              : `solid 2px ${LIGHT_GREEN}`,
            borderTop: 0,
            color: isButtonDisabled ? 'rgba(0,0,0,.2)' : 'black',
            cursor: isButtonDisabled ? 'auto' : 'pointer',
          }}
        >
          <Iconify
            icon={'material-symbols:add'}
            width={50}
            sx={{
              m: -2,
              position: 'absolute',
              bottom: 21,
              left: 20,
            }}
          />
          <Stack spacing={2} sx={{ ml: 5 }}>
            <Typography variant="subtitle2" noWrap>
              ADD NEW CATEGORY
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
