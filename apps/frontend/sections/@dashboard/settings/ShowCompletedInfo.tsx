import { Box, Typography } from '@mui/material';
import React from 'react';
import { getBackgroundColor } from '../../../utils/colors/getBackgroundColor';
import Iconify from '../../../components/iconify';

export default function ShowCompletedInfoSettings({
  isSaving,
  setOpenedSettingOption,
  currentSettingOption,
  disableHover,
}) {
  return (
    <Box
      key={`${currentSettingOption.id}_success`}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.4, currentSettingOption.color.hex),
        borderRadius: '10px',
        border: `solid 1px ${getBackgroundColor(
          0.4,
          currentSettingOption.color.hex
        )}`,
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '52px',
        '&:hover': !disableHover &&
          !isSaving && {
            cursor: 'pointer',
            border: `solid 1px ${getBackgroundColor(
              1,
              currentSettingOption.color.hex
            )}`,
          },
      }}
      onClick={() =>
        !isSaving && setOpenedSettingOption(currentSettingOption.name)
      }
    >
      <Box sx={{ display: 'flex', mr: '-12px' }}>
        <Box
          sx={{
            ml: '-3px',
            pr: '-3px',
            color: currentSettingOption.color.hex,
          }}
          onClick={() => !isSaving && null}
        >
          <Iconify
            icon={'fluent-emoji-high-contrast:red-exclamation-mark'}
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
            display: 'flex',
            justifyContent: 'flex-start',
            alignContent: 'flex-start',
            gap: '10px',
            flex: 1,
          }}
        >
          <Box sx={{ margin: '6px', marginLeft: '-5px' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: isSaving ? '#637381' : undefined }}
            >
              {currentSettingOption.successText}
            </Typography>
            <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mb: 0 }}
              >
                {currentSettingOption.subtitle}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/*<Box*/}
      {/*  sx={{ display: 'flex', width: '100%' }}*/}
      {/*  onClick={() =>*/}
      {/*    isSaving*/}
      {/*      ? null*/}
      {/*      : isActive*/}
      {/*      ? setOpenedSettingOption(undefined)*/}
      {/*      : setOpenedSettingOption(*/}
      {/*          SettingOption[currentSettingOption]*/}
      {/*        )*/}
      {/*  }*/}
      {/*>*/}
      {/*  <Box*/}
      {/*    sx={{*/}
      {/*      width: `60px`,*/}
      {/*      minWidth: '60px',*/}
      {/*      p: 2,*/}
      {/*      background: getRepeatingLinearGradient(*/}
      {/*        isSaving*/}
      {/*          ? IS_SAVING_HEX*/}
      {/*          : optionsColors[currentSettingOption].hex,*/}
      {/*        0.3*/}
      {/*      ),*/}
      {/*      border: isSaving*/}
      {/*        ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*            ...getRgbaObjectFromHexString(IS_SAVING_HEX),*/}
      {/*            a: 0.5,*/}
      {/*          })}`*/}
      {/*        : isActive*/}
      {/*        ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*            ...optionsColors[currentSettingOption].rgb,*/}
      {/*            a: 0.5,*/}
      {/*          })}`*/}
      {/*        : `solid 2px ${getHexFromRGBAObject({*/}
      {/*            ...optionsColors[currentSettingOption].rgb,*/}
      {/*            a: 0.3,*/}
      {/*          })}`,*/}
      {/*      borderRight: 0,*/}
      {/*      borderTopLeftRadius: 12,*/}
      {/*      borderBottomLeftRadius: 12,*/}
      {/*    }}*/}
      {/*  />*/}
      {/*  <Box*/}
      {/*    sx={{*/}
      {/*      color: isSaving*/}
      {/*        ? IS_SAVING_HEX*/}
      {/*        : getHexFromRGBObject(*/}
      {/*            getColorShadeBasedOnSliderPickerSchema(*/}
      {/*              optionsColors[currentSettingOption].rgb,*/}
      {/*              'normal'*/}
      {/*            )*/}
      {/*          ),*/}
      {/*      background: isSaving*/}
      {/*        ? SUPER_LIGHT_SILVER*/}
      {/*        : isActive*/}
      {/*        ? getHexFromRGBAObject({*/}
      {/*            ...optionsColors[currentSettingOption].rgb,*/}
      {/*            a: 0.24,*/}
      {/*          })*/}
      {/*        : getHexFromRGBAObject({*/}
      {/*            ...optionsColors[currentSettingOption].rgb,*/}
      {/*            a: 0.1,*/}
      {/*          }),*/}
      {/*      flex: 1,*/}
      {/*      border: isSaving*/}
      {/*        ? `solid 2px ${getHexFromRGBAObject({*/}
      {/*            ...getRgbaObjectFromHexString(IS_SAVING_HEX),*/}
      {/*            a: 0.5,*/}
      {/*          })}`*/}
      {/*        : `solid 2px ${*/}
      {/*            isActive*/}
      {/*              ? getHexFromRGBAObject({*/}
      {/*                  ...optionsColors[currentSettingOption]*/}
      {/*                    .rgb,*/}
      {/*                  a: 0.5,*/}
      {/*                })*/}
      {/*              : LIGHT_RED*/}
      {/*          }`,*/}
      {/*      borderLeft: 0,*/}
      {/*      borderRadius: '12px',*/}
      {/*      borderTopLeftRadius: 0,*/}
      {/*      borderBottomLeftRadius: 0,*/}
      {/*      cursor: !isSaving && 'pointer',*/}
      {/*      '&:hover': !disableHover &&*/}
      {/*        !isSaving && {*/}
      {/*          border: isActive*/}
      {/*            ? `solid 2px ${RED}`*/}
      {/*            : `solid 2px ${getHexFromRGBAObject({*/}
      {/*                ...optionsColors[currentSettingOption].rgb,*/}
      {/*                a: 0.5,*/}
      {/*              })}`,*/}
      {/*          borderStyle: isActive ? 'solid' : 'dashed',*/}
      {/*          borderLeft: 0,*/}
      {/*        },*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Stack*/}
      {/*      spacing={1}*/}
      {/*      sx={{ p: 3 }}*/}
      {/*      direction="row"*/}
      {/*      alignItems="center"*/}
      {/*      justifyContent="left"*/}
      {/*    >*/}
      {/*      <Typography variant="subtitle2" noWrap>*/}
      {/*        {SettingOption[currentSettingOption]}*/}
      {/*      </Typography>*/}
      {/*    </Stack>*/}
      {/*  </Box>*/}
      {/*</Box>*/}
    </Box>
  );
}
