import PropTypes from 'prop-types';
// @mui
import {Box, Card, Grid, Stack, Typography} from '@mui/material'; // utils
import Iconify from '../../../components/iconify';
import SubcategoryCard from './SubcategoryCard';
import {GREEN, IS_SAVING_HEX, LIGHT_GREEN, LIGHT_RED, LIGHT_SILVER, RED, SUPER_LIGHT_SILVER,} from '../../../consts/colors';
import {getRepeatingLinearGradient} from '../../../utils/colors/getRepeatingLinearGradient';
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import EditCategory from './EditCategory';
import AddNew from './AddNew';
import {CreateNewType} from '../../../enum/createNewType';
import {CategoriesPageMode} from '../../../enum/categoriesPageMode';
import React, {useEffect, useState} from 'react';
import ShowLimitReached from './ShowLimitReached';
import {ShowLimitReachedType} from '../../../enum/showLimitReachedType';
import {handleFetch} from '../../../utils/fetchingData/handleFetch';
import {getHexFromRGBAString} from '../../../utils/colors/getHexFromRGBString';
import {StatusCodes} from 'http-status-codes';
import {mapTimeLogsToDateTimeLogs} from '../../../utils/mapper/mapTimeLogsToDateTimeLogs';
import {Timezones} from '@test1/shared';
import {DateTime} from 'luxon';
import {getDuration} from '../../../utils/mapper/getDuration';

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
                                       limits,
                                       disableHover,
                                     }) {
  const currentGroupedTimeLog = groupedTimeLogsWithDateSorted
    .filter(
      (groupedTimeLogWithDateSorted) =>
        !groupedTimeLogWithDateSorted.subcategory
    )
    .find(
      (groupedTimeLogWithDateSorted) =>
        groupedTimeLogWithDateSorted.category?.id === category?.id
    );

  const [totalPeriodInMs, setTotalPeriodInMs] = useState(
    groupedTimeLogsWithDateSorted?.totalPeriodInMsWithoutUnfinishedTimeLog
  );

  useEffect(() => {
    if (!currentGroupedTimeLog) {
      return;
    }
    if (!currentGroupedTimeLog.notFinishedPeriod) {
      return setTotalPeriodInMs(
        currentGroupedTimeLog.totalPeriodInMsWithoutUnfinishedTimeLog
      );
    }
    const setTotalPeriodInMsWithUnfinishedTimeLog = () => {
      const now = DateTime.now().setZone(Timezones[user.timezone]);
      const unfinishedPeriodDuration = currentGroupedTimeLog?.notFinishedPeriod
        ? now.ts - currentGroupedTimeLog.notFinishedPeriod.startedAt.ts
        : 0;
      if (isNaN(unfinishedPeriodDuration)) {
        return console.log(`unfinishedPeriodDuration is NaN`);
      }
      setTotalPeriodInMs(
        currentGroupedTimeLog.totalPeriodInMsWithoutUnfinishedTimeLog +
        unfinishedPeriodDuration
      );
    };
    setTotalPeriodInMsWithUnfinishedTimeLog();
    const intervalIdLocal = setInterval(
      () => setTotalPeriodInMsWithUnfinishedTimeLog(),
      1000
    );
    return () => clearInterval(intervalIdLocal);
  }, [groupedTimeLogsWithDateSorted]);

  const {active: isActive} = category;

  const doesAnySubcategoryWithinCurrentCategoryActive =
    !!category.subcategories.find((subcategory) => subcategory.active);

  const reverseExpandSubcategories = async () => {
    await setCategoryExpandSubcategoriesInDB(!category.expandSubcategories);
    setCategories(
      [...categories].map((_category) => {
        if (_category.id === category.id) {
          return {
            ..._category,
            expandSubcategories: !_category.expandSubcategories,
          };
        }
        return {..._category};
      })
    );
  };

  const getVisibleSubcategories = (category, categories) => {
    return (
      categories
        .find((_category) => _category.id === category.id)
        ?.subcategories?.filter((subcategory) =>
        viewMode === CategoriesPageMode.EDIT ? true : subcategory.visible
      ) || []
    );
  };

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
          const subcategories = category.subcategories;
          if (category.id === response.category?.id) {
            return {...response.category, subcategories};
          }
          return {...category, subcategories};
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
      body: {categoryId: category.id, controlValue},
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.category) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            subcategory.active = false;
            return subcategory;
          });
          if (category.id === response.category?.id) {
            return {...response.category, subcategories};
          }
          return {...category, active: false, subcategories};
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

  const setCategoryExpandSubcategoriesInDB = async (value) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-expand-subcategories',
      body: {
        categoryId: category.id,
        expandSubcategories: value,
        controlValue,
      },
      method: 'POST',
    });
    if (response.controlValue) {
      setControlValue(response.controlValue);
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      setIsSaving(true);
      return;
    }
    setIsSaving(false);
    return;
  };

  const setCategoryAsDeleted = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'category/set-as-deleted',
      body: {categoryId: category.id, controlValue},
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
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
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
          <Box sx={{display: 'flex'}}>
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
                  subcategoryId: undefined,
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
                    border:
                      isActive && !doesAnySubcategoryWithinCurrentCategoryActive
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
                sx={{p: 3}}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <Typography variant="subtitle3" noWrap>
                  DELETE:{' '}
                  <span
                    style={{fontWeight: 'bold', textDecoration: 'underline'}}
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
                  m: -2,
                  position: 'absolute',
                  bottom: 34,
                  right: 27,
                }}
              />
            </Box>
          </Box>
        </Card>
      ) : (
        <Card>
          <Box sx={{display: 'flex'}}>
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
                      m: -2,
                      position: 'absolute',
                      bottom: 34,
                      left: 27,
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
                        subcategoryId: undefined,
                        categoryId: category.id,
                        createNew: undefined,
                      });
                    }
                    return setIsEditing({
                      categoryId: undefined,
                      subcategoryId: undefined,
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
                      m: -2,
                      position: 'absolute',
                      bottom: 34,
                      left: 88,
                    }}
                  />
                </Box>
              </>
            )}
            {viewMode === CategoriesPageMode.VIEW && (
              <Box
                sx={{
                  width: `65px`,
                  minWidth: '65px',
                  p: 2,
                  background: isSaving
                    ? IS_SAVING_HEX
                    : isActive
                      ? LIGHT_GREEN
                      : LIGHT_RED,
                  border: isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                      ? `solid 2px ${LIGHT_GREEN}`
                      : `solid 2px ${LIGHT_RED}`,
                  borderRight: 0,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                }}
              >
                <Iconify
                  icon={
                    category.active
                      ? 'material-symbols:play-arrow'
                      : 'material-symbols:pause-rounded'
                  }
                  width={40}
                  sx={{
                    color: isSaving
                      ? SUPER_LIGHT_SILVER
                      : category.active
                        ? GREEN
                        : RED,
                    position: 'relative',
                    top: '50%',
                    left: '42%',
                    transform: 'translate(-40%, -50%)',
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: isSaving
                  ? SUPER_LIGHT_SILVER
                  : getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(category?.color),
                    a: 0.18,
                  }),
                flex: 1,
                border: isSaving
                  ? `solid 2px ${IS_SAVING_HEX}`
                  : `solid 2px ${getHexFromRGBAObject({
                    ...getRgbaObjectFromHexString(category?.color),
                    a: 0.3,
                  })}`,
                borderLeft: 0,
                borderRadius:
                  getVisibleSubcategories(category, categories).length ||
                  viewMode !== CategoriesPageMode.VIEW
                    ? 0
                    : '12px',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW &&
                  'pointer',
                '&:hover': !disableHover &&
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW && {
                    border: !isActive
                      ? `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(
                          getHexFromRGBAString(GREEN)
                        ),
                        a: 0.7,
                      })}`
                      : `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(
                          getHexFromRGBAString(RED)
                        ),
                        a: 0.7,
                      })}`,
                    borderLeft: 0,
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
                sx={{p: 3}}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <Typography variant="subtitle2">
                  {getCategory(category, categories)?.name}
                  {getCategory(category, categories)?.active && (
                    <>
                      {' '}
                      <span
                        style={{
                          color: isSaving
                            ? IS_SAVING_HEX
                            : getHexFromRGBAObject({
                              ...getRgbaObjectFromHexString(
                                getHexFromRGBAString(GREEN)
                              ),
                              a: 1,
                            }),
                        }}
                      >
                        *active*
                      </span>
                    </>
                  )}
                  {totalPeriodInMs && (
                    <>
                      <br/>
                      {getDuration(totalPeriodInMs)}
                    </>
                  )}
                </Typography>
              </Stack>
            </Box>
            {(getVisibleSubcategories(category, categories).length ||
              viewMode !== CategoriesPageMode.VIEW) && (
              <Box
                sx={{
                  width: `60px`,
                  p: 2,
                  color: isSaving
                    ? IS_SAVING_HEX
                    : !getCategory(category, categories)?.expandSubcategories
                      ? GREEN
                      : RED,
                  background: `white`,
                  border: `solid 2px ${LIGHT_SILVER}`,
                  borderLeft: `0px`,
                  borderTopRightRadius: 12,
                  borderBottomRightRadius: 12,
                  cursor: !isSaving && 'pointer',
                  '&:hover': !disableHover &&
                    !isSaving && {
                      borderLeft: `0px`,
                    },
                }}
                onClick={() =>
                  !isSaving && reverseExpandSubcategories(category, categories)
                }
              >
                <Iconify
                  icon={
                    getCategory(category, categories)?.expandSubcategories
                      ? 'eva:chevron-up-fill'
                      : 'eva:chevron-down-fill'
                  }
                  width={50}
                  sx={{m: -2, position: 'absolute', bottom: 27, right: 20}}
                />
              </Box>
            )}
          </Box>
        </Card>
      )}

      {viewMode === CategoriesPageMode.VIEW &&
      !getVisibleSubcategories(category, categories)
        .length ? undefined : getCategory(category, categories)
        ?.expandSubcategories ||
      getVisibleSubcategories(category, categories).filter(
        (subcategory) => subcategory.active
      ).length ? (
        <Grid container spacing={2} columns={12}>
          <Grid key={'edit_categories'} item xs={1} sm={1} md={1}></Grid>
          <Grid item xs={11} sm={11} md={11}>
            <Box
              sx={{
                flex: 1,
              }}
            >
              {getCategory(category, categories)?.expandSubcategories ? (
                <>
                  {getVisibleSubcategories(category, categories) ||
                  viewMode === CategoriesPageMode.EDIT ? (
                    <Box
                      sx={{display: 'flex', flexDirection: 'column', gap: 2}}
                    >
                      {getVisibleSubcategories(category, categories).length ||
                      viewMode === CategoriesPageMode.EDIT
                        ? getVisibleSubcategories(category, categories).map(
                          (subcategory) => (
                            <SubcategoryCard
                              groupedTimeLogsWithDateSorted={
                                groupedTimeLogsWithDateSorted
                              }
                              user={user}
                              checkActiveDateCorrectness={
                                checkActiveDateCorrectness
                              }
                              timeLogsWithinActiveDate={
                                timeLogsWithinActiveDate
                              }
                              setTimeLogsWithinActiveDate={
                                setTimeLogsWithinActiveDate
                              }
                              controlValue={controlValue}
                              setControlValue={setControlValue}
                              key={subcategory.id}
                              disableHover={disableHover}
                              subcategory={subcategory}
                              categories={categories}
                              setCategories={setCategories}
                              isEditing={isEditing}
                              setIsEditing={setIsEditing}
                              viewMode={viewMode}
                              isSaving={isSaving}
                              setIsSaving={setIsSaving}
                            />
                          )
                        )
                        : undefined}
                      {viewMode === CategoriesPageMode.EDIT && (
                        <>
                          {category.subcategories.length <
                          limits.subcategoriesLimit ? (
                            <AddNew
                              controlValue={controlValue}
                              setControlValue={setControlValue}
                              disableHover={disableHover}
                              type={CreateNewType.SUBCATEGORY}
                              data={{categoryId: category.id}}
                              isEditing={isEditing}
                              setIsEditing={setIsEditing}
                              category={category}
                              isSaving={isSaving}
                              setIsSaving={setIsSaving}
                              categories={categories}
                              setCategories={setCategories}
                            />
                          ) : (
                            <ShowLimitReached
                              type={ShowLimitReachedType.SUBCATEGORIES}
                            />
                          )}
                        </>
                      )}
                    </Box>
                  ) : undefined}
                </>
              ) : undefined}
            </Box>
          </Grid>
        </Grid>
      ) : undefined}
    </Box>
  );
}
