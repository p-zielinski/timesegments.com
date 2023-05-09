import { Box, Grid, Stack, Typography } from '@mui/material';
import { IS_SAVING_HEX } from '../../../consts/colors';
import { getHexFromRGBObject } from '../../../utils/colors/getHexFromRGBObject';
import { getColorShadeBasedOnSliderPickerSchema } from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import { getHexFromRGBAObject } from '../../../utils/colors/getHexFromRGBAObject';
import { getRgbaObjectFromHexString } from '../../../utils/colors/getRgbaObjectFromHexString';
import { getRepeatingLinearGradient } from '../../../utils/colors/getRepeatingLinearGradient';
import React, { useEffect, useState } from 'react';
import { DashboardPageState } from '../../../enum/DashboardPageState';
import { getRandomRgbObjectForSliderPicker } from '../../../utils/colors/getRandomRgbObjectForSliderPicker';
import Iconify from '../../../components/iconify';
import navConfig from '../../../layouts/dashboard/nav/config';
import { useRouter } from 'next/router';

export const GoToCategoriesOrNotes = ({
  currentPageState,
  setCurrentPageState,
  isSaving,
  disableHover,
}) => {
  const router = useRouter();

  const changeUrlAndPageStateToProvidedValue = (state: DashboardPageState) => {
    setCurrentPageState(state);
    const desiredNavConfigItem = navConfig.find(
      (configItem) => configItem.state === state
    );
    const { path, query } = desiredNavConfigItem;
    if (router.pathname === path) {
      const currentUrl = new URL(window.location.href);
      const origin = currentUrl.origin;
      const pathname = currentUrl.pathname;
      if (query) {
        const desiredQuery = new URLSearchParams(query).toString();
        return window.history.replaceState(
          null,
          '',
          origin + pathname + '?' + desiredQuery
        );
      }
      window.history.replaceState(null, '', origin + pathname);
      return;
    }
    if (query) {
      router.push(path + '?' + new URLSearchParams(query).toString());
      return;
    }
    router.push(path);
    return;
  };

  const categoriesColor = {
    hex: '#c400aa',
    rgb: getRgbaObjectFromHexString('#c400aa'),
  };
  const notesColor = {
    hex: '#c400aa',
    rgb: getRgbaObjectFromHexString('#c400aa'),
  };

  const getCurrentColor = () => {
    return currentPageState === DashboardPageState.CATEGORIES
      ? notesColor
      : currentPageState === DashboardPageState.NOTES
      ? categoriesColor
      : getRandomRgbObjectForSliderPicker();
  };

  const [color, setColor] = useState(getCurrentColor());
  useEffect(() => {
    const desiredColor = getCurrentColor();
    if (desiredColor !== color) {
      setColor(desiredColor);
    }
  }, [currentPageState]);

  useEffect(() => {
    setColor(getCurrentColor());
  }, [currentPageState]);

  return (
    <Grid container spacing={2} columns={1}>
      <Grid key={color.hex} item xs={1} sm={1} md={1} sx={{ mb: 0 }}>
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <Box
            onClick={() => {
              if (currentPageState === DashboardPageState.CATEGORIES) {
                return changeUrlAndPageStateToProvidedValue(
                  DashboardPageState.NOTES
                );
              }
              if (currentPageState === DashboardPageState.NOTES) {
                changeUrlAndPageStateToProvidedValue(
                  DashboardPageState.CATEGORIES
                );
              }
              return;
            }}
            sx={{
              color: isSaving
                ? IS_SAVING_HEX
                : getHexFromRGBObject(
                    getColorShadeBasedOnSliderPickerSchema(color.rgb, 'normal')
                  ),
              background: getRepeatingLinearGradient(
                isSaving ? IS_SAVING_HEX : color.hex,
                0.1,
                135,
                false
              ),
              flex: 1,
              maxWidth: 'calc(100% - 60px)',
              border: isSaving
                ? `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                    a: 0.5,
                  })}`
                : `solid 2px ${getHexFromRGBAObject({
                    ...color.rgb,
                    a: 0.3,
                  })}`,
              borderRight: 0,
              borderRadius: '12px',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              cursor: !isSaving && 'pointer',
              '&:hover': !disableHover &&
                !isSaving && {
                  border: `solid 2px ${getHexFromRGBAObject({
                    ...color.rgb,
                    a: 0.5,
                  })}`,
                  borderStyle: 'dashed',
                  borderRight: 0,
                },
            }}
          >
            <Stack
              spacing={1}
              sx={{ p: 3, pr: 0.4 }}
              direction="row"
              alignItems="center"
              justifyContent="left"
            >
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ display: 'flex', pl: 5 }}
              >
                {currentPageState === DashboardPageState.CATEGORIES ? (
                  <>
                    <Iconify
                      icon={'material-symbols:note-alt-outline'}
                      width={40}
                      sx={{
                        position: 'absolute',
                        ml: -6,
                        mt: -1,
                      }}
                    />
                    GO TO RECENT NOTES
                  </>
                ) : currentPageState === DashboardPageState.NOTES ? (
                  <>
                    <Iconify
                      icon={'fluent:shifts-activity-24-filled'}
                      width={40}
                      sx={{
                        position: 'absolute',
                        ml: -6,
                        mt: -1,
                      }}
                    />
                    GO TO CATEGORIES
                  </>
                ) : (
                  'ERROR'
                )}
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: `60px`,
              minWidth: '60px',
              p: 2,
              background: getRepeatingLinearGradient(
                isSaving ? IS_SAVING_HEX : color.hex,
                0.3
              ),
              border: isSaving
                ? `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(IS_SAVING_HEX),
                    a: 0.5,
                  })}`
                : `solid 2px ${getHexFromRGBAObject({
                    ...color.rgb,
                    a: 0.3,
                  })}`,
              borderLeft: 0,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
            }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};
