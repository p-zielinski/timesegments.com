import PropTypes from 'prop-types';
// @mui
import {Box, Typography} from '@mui/material'; // utils
import Iconify from '../../../components/iconify';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import EditCategory from './EditCategory';
import React, {useEffect, useState} from 'react';
import {handleFetch} from '../../../utils/fetchingData/handleFetch';
import {StatusCodes} from 'http-status-codes';
import {mapTimeLogToDateTimeLogs} from '../../../utils/mapper/mapTimeLogsToDateTimeLogs';
import {Timezones} from '@test1/shared';
import {DateTime} from 'luxon';
import {getDuration} from '../../../utils/mapper/getDuration';
import {TimelineDot} from '@mui/lab';
import {getHexFromRGBObject} from '../../../utils/colors/getHexFromRGBObject';
import {getColorShadeBasedOnSliderPickerSchema} from '../../../utils/colors/getColorShadeBasedOnSliderPickerSchema';
import {getBackgroundColor} from '../../../utils/colors/getBackgroundColor';

// ----------------------------------------------------------------------

Category.propTypes = {
  category: PropTypes.object,
};

export default function Category({
  limits,
  groupedTimeLogsWithDateSorted,
  user,
  checkActiveDateCorrectness,
  timeLogsWithinActiveDate,
  setTimeLogsWithinActiveDate,
  controlValue,
  setControlValue,
  category,
  categories,
  setCategories,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  disableHover,
}) {
  const categoriesNotesLimit = limits?.categoriesNotesLimit || 5;
  const currentCategoryNumberOfNotes = (category.notes || []).length;

  const [totalPeriodInMs, setTotalPeriodInMs] = useState(
    groupedTimeLogsWithDateSorted?.totalPeriodInMsWithoutUnfinishedTimeLog
  );

  const hideDuration = category.active && isEditing.categoryId === category.id;

  useEffect(() => {
    const currentGroupedTimeLog = groupedTimeLogsWithDateSorted.find(
      (groupedTimeLogWithDateSorted) =>
        groupedTimeLogWithDateSorted.category?.id === category?.id
    );

    if (!currentGroupedTimeLog) {
      return;
    }
    if (!currentGroupedTimeLog.notFinishedPeriod) {
      return setTotalPeriodInMs(
        currentGroupedTimeLog.totalPeriodInMsWithoutUnfinishedTimeLog
      );
    }
    const setTotalPeriodInMsWithUnfinishedTimeLog = () => {
      if (hideDuration) {
        return;
      }
      const now = DateTime.now().setZone(Timezones[user.timezone]);
      const unfinishedPeriodDuration = currentGroupedTimeLog?.notFinishedPeriod
        ? now.ts - currentGroupedTimeLog.notFinishedPeriod.startedAt.ts
        : 0;
      if (isNaN(unfinishedPeriodDuration)) {
        return console.log(`unfinishedPeriodDuration is NaN`);
      }
      const totalPeriodDuration =
        currentGroupedTimeLog.totalPeriodInMsWithoutUnfinishedTimeLog +
        unfinishedPeriodDuration;
      if (totalPeriodDuration > 0) {
        setTotalPeriodInMs(totalPeriodDuration);
      }
    };
    setTotalPeriodInMsWithUnfinishedTimeLog();
    const intervalIdLocal = setInterval(
      () => setTotalPeriodInMsWithUnfinishedTimeLog(),
      1000
    );
    return () => clearInterval(intervalIdLocal);
  }, [groupedTimeLogsWithDateSorted, isEditing]);

  const changeShowRecentNotes = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-show-recent-notes',
      body: {
        categoryId: category.id,
        showRecentNotes: !category.showRecentNotes,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories(
        categories.map((category) => {
          if (category.id === response.category?.id) {
            return { ...response.category, notes: category?.notes };
          }
          return { ...category };
        })
      );
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

  const changeCategoryActiveState = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-active',
      body: { categoryId: category.id, controlValue },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories(
        categories.map((category) => {
          if (category.id === response.category?.id) {
            return { ...response.category, notes: category?.notes };
          }
          return { ...category };
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
      if (!checkActiveDateCorrectness()) {
        return; //skip setting isSaving(false)
      }
      if (response.timeLog) {
        const responseTimeLogId = response.timeLog.id;
        const timeLogExtended = mapTimeLogToDateTimeLogs(
          response.timeLog,
          Timezones[user.timezone],
          categories
        );
        setTimeLogsWithinActiveDate([
          ...timeLogsWithinActiveDate.filter(
            (timeLogsExtended) =>
              responseTimeLogId !== timeLogsExtended.timeLogId
          ),
          timeLogExtended,
        ]);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  if (isEditing.categoryId === category.id) {
    return (
      <EditCategory
        controlValue={controlValue}
        setControlValue={setControlValue}
        categories={categories}
        setCategories={setCategories}
        category={category}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
      />
    );
  }

  const duration = getDuration(totalPeriodInMs);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        background: getBackgroundColor(0.2, category.color),
        borderRadius: '10px',
        pl: 0,
        m: 0,
        pr: 1.5,
        minHeight: '30px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignContent: 'flex-start',
          gap: '10px',
          borderRadius: '10px',
          border: `solid 1px ${getBackgroundColor(
            category.active ? 1 : 0.2,
            category.color
          )}`,
          flex: 1,
          '&:hover': !disableHover &&
            !isSaving && {
              cursor: 'pointer',
              border: `solid 1px ${getBackgroundColor(1, category.color)}`,
            },
        }}
        onClick={() => !isSaving && changeCategoryActiveState()}
      >
        <Box sx={{ marginLeft: '10px' }}>
          <TimelineDot sx={{ background: category.color, mb: 0 }} />
        </Box>
        <Box sx={{ margin: '6px', marginLeft: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: isSaving ? '#637381' : undefined }}
          >
            {category?.name}
            <span
              style={{
                color: isSaving
                  ? '#637381'
                  : getHexFromRGBObject(
                      getColorShadeBasedOnSliderPickerSchema(
                        getRgbaObjectFromHexString(category.color)
                      )
                    ),
                fontWeight: 400,
              }}
            >
              {category.active && ' *active*'}
            </span>
          </Typography>
          <Box sx={{ display: 'flex', direction: 'column', mb: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mb: 0 }}
            >
              Duration today:
              <br />
              {duration}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', mr: '-12px' }}>
        <Box
          sx={{
            borderRadius: '10px',
            border: `solid 1px ${getBackgroundColor(0.2, category.color)}`,

            pl: '5px',
            pr: disableHover ? 0 : '5px',
            '&:hover': !disableHover &&
              !isSaving && {
                cursor: 'pointer',
                border: `solid 1px ${getBackgroundColor(1, category.color)}`,
              },
          }}
          onClick={() =>
            !isSaving &&
            setIsEditing({
              categoryId: category.id,
            })
          }
        >
          <Iconify
            icon={'fluent:edit-32-regular'}
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
        {category.showRecentNotes &&
          categoriesNotesLimit > currentCategoryNumberOfNotes && (
            <Box
              sx={{
                borderRadius: '10px',
                border: `solid 1px ${getBackgroundColor(
                  isEditing.createNewNote === category.id ? 1 : 0.2,
                  category.color
                )}`,
                pl: disableHover ? 0 : '5px',
                pr: disableHover ? 0 : '5px',
                '&:hover': !disableHover &&
                  !isSaving && {
                    cursor: 'pointer',
                    border: `solid 1px ${getBackgroundColor(
                      1,
                      category.color
                    )}`,
                  },
              }}
              onClick={() =>
                !isSaving && setIsEditing({ createNewNote: category.id })
              }
            >
              <Iconify
                icon={'ic:outline-note-add'}
                width={40}
                sx={{
                  position: 'relative',
                  top: '50%',
                  left: '40%',
                  transform: 'translate(-40%, -50%)',
                }}
              />
            </Box>
          )}
        <Box
          sx={{
            borderRadius: '10px',
            border: `solid 1px ${getBackgroundColor(0.2, category.color)}`,
            pl: disableHover ? 0 : '5px',
            ml: disableHover ? '-5px' : 0,
            pr: '5px',
            '&:hover': !disableHover &&
              !isSaving && {
                cursor: 'pointer',
                border: `solid 1px ${getBackgroundColor(1, category.color)}`,
              },
          }}
          onClick={() => !isSaving && changeShowRecentNotes()}
        >
          <Iconify
            icon={
              category.showRecentNotes
                ? 'eva:chevron-up-fill'
                : 'eva:chevron-down-fill'
            }
            width={40}
            sx={{
              position: 'relative',
              top: '50%',
              left: '40%',
              transform: 'translate(-40%, -50%)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}