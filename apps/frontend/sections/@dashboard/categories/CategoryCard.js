import PropTypes from 'prop-types';
// @mui
import {Box, Card, Stack, Typography} from '@mui/material'; // utils
import Iconify from '../../../components/iconify';
import {GREEN, IS_SAVING_HEX, LIGHT_GREEN, LIGHT_RED, LIGHT_SILVER, RED, SUPER_LIGHT_SILVER,} from '../../../consts/colors';
import {getRepeatingLinearGradient} from '../../../utils/colors/getRepeatingLinearGradient';
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import EditCategory from './EditCategory';
import {CategoriesPageMode} from '../../../enum/categoriesPageMode';
import React, {useEffect, useState} from 'react';
import {handleFetch} from '../../../utils/fetchingData/handleFetch';
import {getHexFromRGBAString} from '../../../utils/colors/getHexFromRGBString';
import {StatusCodes} from 'http-status-codes';
import {mapTimeLogsToDateTimeLogs} from '../../../utils/mapper/mapTimeLogsToDateTimeLogs';
import {Timezones} from '@test1/shared';
import {DateTime} from 'luxon';
import {getDuration} from '../../../utils/mapper/getDuration'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

CategoryCard.propTypes = {
  category: PropTypes.object,
};

export default function CategoryCard({
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
  viewMode,
  isEditing,
  setIsEditing,
  isSaving,
  setIsSaving,
  disableHover,
}) {
  const [totalPeriodInMs, setTotalPeriodInMs] = useState(
    groupedTimeLogsWithDateSorted?.totalPeriodInMsWithoutUnfinishedTimeLog
  );

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
      if (
        isEditing.categoryId === category.id &&
        viewMode === CategoriesPageMode.EDIT
      ) {
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
  }, [groupedTimeLogsWithDateSorted, isEditing, viewMode]);

  const { active: isActive } = category;

  const getCategory = (category, categories) => {
    return categories.find((_category) => _category.id === category.id) || {};
  };

  const changeCategoryVisibility = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/change-visibility',
      body: {
        categoryId: category.id,
        visible: !category.visible,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories(
        categories.map((category) => {
          if (category.id === response.category?.id) {
            return { ...response.category };
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
            return { ...response.category };
          }
          return { ...category, active: false };
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
      if (!checkActiveDateCorrectness()) {
        return; //skip setting isSaving(false)
      }
      if (response.timeLogs) {
        const timeLogsIds = response.timeLogs.map((timeLog) => timeLog.id);
        const timeLogsExtended = mapTimeLogsToDateTimeLogs(
          response.timeLogs,
          Timezones[user.timezone],
          categories
        );
        setTimeLogsWithinActiveDate([
          ...timeLogsWithinActiveDate.filter(
            (timeLogsExtended) =>
              !timeLogsIds.includes(timeLogsExtended.timeLogId)
          ),
          ...timeLogsExtended,
        ]);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  const setCategoryAsDeleted = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-as-deleted',
      body: { categoryId: category.id, controlValue },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories(
        categories.filter((category) => category.id !== response?.category.id)
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {isEditing.categoryId === category.id &&
      viewMode === CategoriesPageMode.EDIT ? (
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
      ) : isEditing?.deleteCategory === category.id ? (
        <Card>
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: `60px`,
                minWidth: '60px',
                p: 2,
                color: isSaving ? IS_SAVING_HEX : GREEN,
                background: isSaving
                  ? `white`
                  : category.active
                  ? SUPER_LIGHT_SILVER
                  : 'white',
                border: `solid 2px ${LIGHT_SILVER}`,
                borderRight: `0px`,
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
                cursor: !isSaving && !category.active && 'pointer',
              }}
              onClick={() =>
                !isSaving &&
                setIsEditing({
                  categoryId: undefined,
                  createNew: undefined,
                  deleteCategory: undefined,
                })
              }
            >
              <Iconify
                icon={'mdi:cancel-bold'}
                width={38}
                sx={{
                  m: -2,
                  position: 'absolute',
                  bottom: 35,
                  left: 28,
                }}
              />
            </Box>
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: isSaving
                  ? SUPER_LIGHT_SILVER
                  : viewMode === CategoriesPageMode.EDIT
                  ? getRepeatingLinearGradient(
                      isSaving ? IS_SAVING_HEX : getHexFromRGBAString(RED),
                      0.3,
                      45,
                      false
                    )
                  : isActive
                  ? LIGHT_GREEN
                  : LIGHT_RED,
                flex: 1,
                border: isSaving
                  ? `solid 2px ${IS_SAVING_HEX}`
                  : `solid 2px ${LIGHT_RED}`,
                borderLeft: 0,
                borderRight: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW &&
                  'pointer',
                '&:hover': !disableHover &&
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW && {
                    border: isActive
                      ? `solid 2px ${RED}`
                      : `solid 2px ${GREEN}`,
                    borderStyle: 'dashed',
                    borderLeft: 0,
                    borderRight: 0,
                  },
              }}
              onClick={() => !isSaving && null}
            >
              <Stack
                spacing={1}
                sx={{ p: 3 }}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <Typography variant="subtitle3" noWrap>
                  DELETE:{' '}
                  <span
                    style={{ fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    {getCategory(category, categories)?.name?.toUpperCase()}
                  </span>{' '}
                  ?
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                width: `61px`,
                p: 2,
                color: isSaving ? IS_SAVING_HEX : RED,
                background: `white`,
                border: `solid 2px ${LIGHT_SILVER}`,
                borderLeft: `0px`,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                cursor: !isSaving && 'pointer',
                '&:hover': !disableHover &&
                  !isSaving && {
                    borderLeft: `0px`,
                    borderColor: RED,
                  },
              }}
              onClick={() => !isSaving && setCategoryAsDeleted()}
            >
              <Iconify
                icon={'material-symbols:delete-forever-rounded'}
                width={40}
                sx={{
                  position: 'relative',
                  top: '50%',
                  left: '42%',
                  transform: 'translate(-40%, -50%)',
                }}
              />
            </Box>
          </Box>
        </Card>
      ) : (
        <Card>
          <Box sx={{ display: 'flex' }}>
            {viewMode === CategoriesPageMode.EDIT && (
              <>
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color:
                      isSaving || category.active
                        ? IS_SAVING_HEX
                        : category.visible
                        ? GREEN
                        : RED,
                    background: isSaving
                      ? `white`
                      : category.active
                      ? SUPER_LIGHT_SILVER
                      : 'white',
                    border: `solid 2px ${LIGHT_SILVER}`,
                    borderRight: `0px`,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    cursor: !isSaving && !category.active && 'pointer',
                    '&:hover': !disableHover &&
                      !isSaving &&
                      !category.active && {
                        color: !category.visible ? GREEN : RED,
                      },
                  }}
                  onClick={() =>
                    !isSaving && !category.active && changeCategoryVisibility()
                  }
                >
                  <Iconify
                    icon={
                      category.visible
                        ? 'gridicons:visible'
                        : 'gridicons:not-visible'
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
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color: isSaving
                      ? IS_SAVING_HEX
                      : category.visible
                      ? GREEN
                      : RED,
                    background: `white`,
                    borderTop: `solid 2px ${LIGHT_SILVER}`,
                    borderBottom: `solid 2px ${LIGHT_SILVER}`,
                    cursor: !isSaving && 'pointer',
                    '&:hover': !disableHover &&
                      !isSaving && {
                        borderTop: `solid 2px ${
                          category.visible ? LIGHT_SILVER : RED
                        }`,
                        borderBottom: `solid 2px ${
                          category.visible ? LIGHT_SILVER : RED
                        }`,
                      },
                  }}
                  onClick={() => {
                    if (isSaving) {
                      return;
                    }
                    if (category.visible) {
                      return setIsEditing({
                        categoryId: category.id,
                        createNew: undefined,
                      });
                    }
                    return setIsEditing({
                      categoryId: undefined,
                      createNew: undefined,
                      deleteCategory: category.id,
                    });
                  }}
                >
                  <Iconify
                    icon={
                      category.visible
                        ? 'material-symbols:edit'
                        : 'material-symbols:delete-forever-rounded'
                    }
                    width={40}
                    sx={{
                      position: 'relative',
                      top: '50%',
                      left: '42%',
                      transform: 'translate(-40%, -50%)',
                    }}
                  />
                </Box>
              </>
            )}
            {viewMode === CategoriesPageMode.VIEW && (
              <Box
                sx={{
                  width: `60px`,
                  minWidth: '60px',
                  p: 2,
                  background: isSaving
                    ? IS_SAVING_HEX
                    : getRepeatingLinearGradient(category?.color, 0.3),
                  border: isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                    ? `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(category?.color),
                        a: 0.3,
                      })}`
                    : `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(category?.color),
                        a: 0.3,
                      })}`,
                  borderRight: 0,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                }}
              />
            )}
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: isSaving
                  ? SUPER_LIGHT_SILVER
                  : viewMode === CategoriesPageMode.EDIT
                  ? getRepeatingLinearGradient(
                      isSaving ? IS_SAVING_HEX : category?.color,
                      0.3,
                      45,
                      false
                    )
                  : isActive
                  ? LIGHT_GREEN
                  : LIGHT_RED,
                flex: 1,
                border: isSaving
                  ? `solid 2px ${IS_SAVING_HEX}`
                  : viewMode === CategoriesPageMode.EDIT
                  ? `solid 2px ${getHexFromRGBAObject({
                      ...getRgbaObjectFromHexString(category?.color),
                      a: 0.3,
                    })}`
                  : isActive
                  ? `solid 2px ${LIGHT_GREEN}`
                  : `solid 2px ${LIGHT_RED}`,
                borderLeft: 0,
                borderRadius: '12px',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW &&
                  'pointer',
                '&:hover': !disableHover &&
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW && {
                    border: isActive
                      ? `solid 2px ${RED}`
                      : `solid 2px ${GREEN}`,
                    borderLeft: 0,
                    borderStyle: 'dashed',
                  },
              }}
              onClick={() =>
                !isSaving &&
                viewMode !== CategoriesPageMode.EDIT &&
                changeCategoryActiveState()
              }
            >
              <Stack
                spacing={1}
                sx={{ p: 3 }}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <Typography variant="subtitle2">
                  {getCategory(category, categories)?.name}
                  {totalPeriodInMs && (
                    <>
                      <br />
                      {getDuration(totalPeriodInMs)}
                    </>
                  )}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}
