// @mui
import {Box, Typography} from '@mui/material';
import {TimelineDot} from '@mui/lab';
import React, {useContext} from 'react';
import {getDuration} from '@test1/shared';
import {getBackgroundColor} from '../../../utils/colors/getBackgroundColor';
import {StoreContext} from '../../../hooks/useStore';
import {useStore} from 'zustand';
import {getHexFromRGBObject} from 'apps/frontend/utils/colors/getHexFromRGBObject';
import {getColorShadeBasedOnSliderPickerSchema} from 'apps/frontend/utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getRgbaObjectFromHexString} from 'apps/frontend/utils/colors/getRgbaObjectFromHexString';
import {DateTime} from 'luxon';
// utils
// ----------------------------------------------------------------------

export default function GroupedPeriod({
  categoryIdNotFinishedStateAndDuration,
}: {
  categoryIdNotFinishedStateAndDuration: {
    categoryId: string;
    duration: number;
    notFinished: boolean;
  };
}) {
  const store = useContext(StoreContext);
  const { categories, showTimeLogsTo } = useStore(store);

  const category = categories.find(
    (category) =>
      category.id === categoryIdNotFinishedStateAndDuration.categoryId
  );
  const color = category.color;
  const hideActive = showTimeLogsTo < DateTime.now().ts;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.2, color),
        borderRadius: '10px',
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '30px',
      }}
    >
      <Box sx={{ marginLeft: '10px' }}>
        <TimelineDot sx={{ background: color, mb: 0 }} />
      </Box>
      <Box
        sx={{ margin: '6px', marginLeft: '10px', marginBottom: '8px', flex: 1 }}
      >
        <Typography variant="subtitle2">
          {category?.name}
          {!hideActive && (
            <span
              style={{
                color: getHexFromRGBObject(
                  getColorShadeBasedOnSliderPickerSchema(
                    getRgbaObjectFromHexString(color)
                  )
                ),
                fontWeight: 400,
              }}
            >
              {categoryIdNotFinishedStateAndDuration.notFinished && ' *active*'}
            </span>
          )}
        </Typography>
        <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0 }}>
            Duration:{' '}
            <b>{getDuration(categoryIdNotFinishedStateAndDuration.duration)}</b>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
