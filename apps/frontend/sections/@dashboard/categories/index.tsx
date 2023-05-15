import PropTypes from 'prop-types';
// @mui
import {Box, Card, Grid, Stack, Typography} from '@mui/material';
import CategoryCard from './CategoryCard';
import Iconify from '../../../components/iconify';
import {IS_SAVING_HEX, LIGHT_RED, RED, SUPER_LIGHT_SILVER,} from '../../../consts/colors';
import React, {useEffect, useState} from 'react';
import AddNew from './AddNew';
import {CategoriesPageMode} from '../../../enum/categoriesPageMode';
import {CreateNewType} from '../../../enum/createNewType';
import ShowNoShow from './ShowNoShow';
import {ShowNoShowType} from '../../../enum/showNoShowType';
import ShowLimitReached from './ShowLimitReached';
import {ShowLimitReachedType} from '../../../enum/showLimitReachedType';
import EditCategoriesButtonComponent from './EditCategoriesButtonComponent';
import CancelCard from './CancelCard';
import SortCategories from './Sort';
import {TimeLogsWithinDate} from '../../../types/timeLogsWithinDate';
import {Timezones} from '@test1/shared';
import {TimeLogWithinCurrentPeriod} from '../../../utils/findTimeLogsWithinCurrentPeriod';
import {findOrFetchTimeLogsWithinActiveDate} from '../../../utils/fetchingData/findOrFetchTimeLogsWithinActiveDate';
import {DateTime} from 'luxon';
import {getGroupedTimeLogsWithDateSorted} from '../../../utils/mapper/getGroupedTimeLogsWithDateSorted';
import {nanoid} from 'nanoid';

// ----------------------------------------------------------------------

CategoriesSection.propTypes = {
  categories: PropTypes.array.isRequired,
  setCategories: PropTypes.func.isRequired,
};

export default function CategoriesSection({
                                            timeLogsWithDatesISO,
                                            user,
                                            controlValue,
                                            setControlValue,
                                            disableHover,
                                            categories,
                                            setCategories,
                                            viewMode,
                                            setViewMode,
                                            isSaving,
                                            setIsSaving,
                                            limits,
                                          }) {
  const [timeLogsWithinDates, setTimeLogsWithinDates] = useState<
    TimeLogsWithinDate[]
  >(
    timeLogsWithDatesISO.map((timeLogWithDatesISO) => {
      return {
        date: DateTime.fromObject(timeLogWithDatesISO.date),
        timeLogsExtended: timeLogWithDatesISO.timeLogsExtended.map(
          (timeLogExtended) => {
            return {
              ...timeLogExtended,
              startedAt: DateTime.fromISO(timeLogExtended.startedAt),
              endedAt: timeLogExtended.ended
                ? DateTime.fromISO(timeLogExtended.endedAt)
                : undefined,
              isIsoString: false,
            };
          }
        ),
      };
    }) as unknown as any
  );
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(Timezones[user.timezone]).set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    })
  );

  const [timeLogsWithinActiveDate, setTimeLogsWithinActiveDate] = useState<
    TimeLogWithinCurrentPeriod[]
  >([]);

  useEffect(() => {
    (async () => {
      setIsSaving(true);
      await setTimeLogsWithinActiveDate(
        await findOrFetchTimeLogsWithinActiveDate(
          activeDate.c,
          timeLogsWithinDates,
          activeDate,
          setTimeLogsWithinDates,
          user
        )
      );
      setIsSaving(false);
    })();
  }, [activeDate?.ts]);

  const [groupedTimeLogsWithDateSorted, setGroupedTimeLogsWithDateSorted] =
    useState([]);

  useEffect(() => {
    setGroupedTimeLogsWithDateSorted(
      getGroupedTimeLogsWithDateSorted(timeLogsWithinActiveDate)
    );
  }, [
    timeLogsWithinActiveDate
      .map((timeLogWithinActiveDate) => timeLogWithinActiveDate?.timeLogId)
      .join(''),
  ]);

  const checkActiveDateCorrectness = () => {
    const today = DateTime.now().setZone(Timezones[user.timezone]).set({
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    if (today.ts === activeDate.ts) {
      return true;
    }
    setActiveDate(today);
    return false;
  };

  const [isEditing, setIsEditing] = useState({
    categoryId: undefined,
    subcategoryId: undefined,
    createNew: undefined,
  });

  const [
    numberOfCategoriesAndSubcategoriesCombined,
    setNumberOfCategoriesAndSubcategoriesCombined,
  ] = useState(0);

  useEffect(() => {
    const subcategoriesNumber = (categories ?? [])
      .filter((category) => category.visible)
      .map((category) => (category.subcategories ?? []).length)
      .reduce((accumulator, currentValue) => accumulator + currentValue + 1, 0);
    setNumberOfCategoriesAndSubcategoriesCombined(subcategoriesNumber);
  }, [categories]);

  const getCategories = (categories) => {
    return categories.filter((category) =>
      viewMode === CategoriesPageMode.VIEW ? category.visible : true
    );
  };

  const [categoriesKey, setCategoriesKey] = useState<string>('categoriesKey');

  useEffect(() => {
    console.log('teraz');
    setCategoriesKey(nanoid());
  }, [
    categories
      .map(
        (category) =>
          category.active.toString() +
          category.subcategories?.map((subcategory) => subcategory.active) ||
          [''].join(',')
      )
      .join(','),
  ]);

  return (
    <Grid container spacing={2} columns={1} sx={{mt: 1}}>
      {viewMode === CategoriesPageMode.EDIT && (
        <Grid key={'edit_categories'} item xs={1} sm={1} md={1}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {categories.length !== 0 && (
              <Card
                sx={{
                  backgroundColor: isSaving
                    ? IS_SAVING_HEX
                    : 'rgba(0,0,0,0.11)',
                  cursor: !isSaving && 'pointer',
                  color: isSaving && IS_SAVING_HEX,
                  border: `solid 2px ${isSaving ? IS_SAVING_HEX : LIGHT_RED}`,
                  background: isSaving ? SUPER_LIGHT_SILVER : LIGHT_RED,
                  '&:hover': !disableHover &&
                    !isSaving && {
                      border: `solid 2px ${RED}`,
                    },
                }}
                onClick={() =>
                  !isSaving && setViewMode(CategoriesPageMode.VIEW)
                }
              >
                <Iconify
                  icon={'mdi:cancel-bold'}
                  width={42}
                  sx={{m: -2, position: 'absolute', bottom: 22, left: 22}}
                />
                <Stack spacing={2} sx={{p: 2, ml: 5}}>
                  <Typography variant="subtitle2" noWrap>
                    STOP EDITING CATEGORIES
                  </Typography>
                </Stack>
              </Card>
            )}
            {categories.length < limits.categoriesLimit ? (
              <AddNew
                controlValue={controlValue}
                setControlValue={setControlValue}
                disableHover={disableHover}
                type={CreateNewType.CATEGORY}
                data={undefined}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                categories={categories}
                setCategories={setCategories}
                category={undefined}
              />
            ) : (
              <ShowLimitReached type={ShowLimitReachedType.CATEGORIES}/>
            )}
          </Box>
        </Grid>
      )}
      {viewMode === CategoriesPageMode.VIEW && (
        <CancelCard
          controlValue={controlValue}
          setControlValue={setControlValue}
          disableHover={disableHover}
          categories={categories}
          setCategories={setCategories}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
        />
      )}
      {viewMode === CategoriesPageMode.VIEW &&
        numberOfCategoriesAndSubcategoriesCombined > 10 && (
          <EditCategoriesButtonComponent
            disableHover={disableHover}
            isSaving={isSaving}
            setViewMode={setViewMode}
          />
        )}

      <Grid key={'sort-categories'} item xs={1} sm={1} md={1}>
        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Stack
            direction="row"
            spacing={1}
            flexShrink={0}
            sx={{mt: -1, mb: -1}}
          >
            <SortCategories
              user={user}
              categories={categories}
              setCategories={setCategories}
              controlValue={controlValue}
              setControlValue={setControlValue}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
            />
          </Stack>
        </Stack>
      </Grid>

      {getCategories(categories).length ? (
        <>
          {getCategories(categories).map((category) => (
            <Grid key={category.id} item xs={1} sm={1} md={1}>
              <CategoryCard
                groupedTimeLogsWithDateSorted={groupedTimeLogsWithDateSorted}
                user={user}
                checkActiveDateCorrectness={checkActiveDateCorrectness}
                timeLogsWithinActiveDate={timeLogsWithinActiveDate}
                setTimeLogsWithinActiveDate={setTimeLogsWithinActiveDate}
                controlValue={controlValue}
                setControlValue={setControlValue}
                disableHover={disableHover}
                viewMode={viewMode}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                category={category}
                categories={categories}
                setCategories={setCategories}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                limits={limits}
              />
            </Grid>
          ))}
        </>
      ) : (
        !isEditing && (
          <ShowNoShow type={ShowNoShowType.CATEGORIES} isSaving={isSaving}/>
        )
      )}
      {viewMode === CategoriesPageMode.VIEW && (
        <EditCategoriesButtonComponent
          isSaving={isSaving}
          setViewMode={setViewMode}
          disableHover={disableHover}
        />
      )}
    </Grid>
  );
}
