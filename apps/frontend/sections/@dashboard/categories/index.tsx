// @mui
import {Box, Grid, Stack} from '@mui/material';
import Category from './Category';
import React, {useState} from 'react';
import AddNew from './AddNew';
import SortCategories from './Sort';
import {Timezones} from '@test1/shared';
import {getCurrentDate} from '../../../utils/getCurrentDate';
import {Helmet} from 'react-helmet-async';
import CategoryNotesCards from './CategoryNotesCards';

// ----------------------------------------------------------------------

export default function Categories({
  activeDate,
  setActiveDate,
  groupedTimeLogsWithDateSorted,
  timeLogsWithinActiveDate,
  setTimeLogsWithinActiveDate,
  user,
  controlValue,
  setControlValue,
  disableHover,
  categories,
  setCategories,
  isSaving,
  setIsSaving,
  limits,
}) {
  const checkActiveDateCorrectness = () => {
    const currentDate = getCurrentDate(Timezones[user.timezone]);
    if (currentDate.ts === activeDate.ts) {
      return true;
    }
    setActiveDate(currentDate);
    return false;
  };

  const [isEditing, setIsEditing] = useState({
    categoryId: undefined,
    createNew: undefined,
  });

  return (
    <>
      <Helmet>
        <title>Categories</title>
      </Helmet>
      <Grid container spacing={2} columns={1} sx={{ mt: 1 }}>
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
              sx={{ mt: -1, mb: -1 }}
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

        {categories.map((category) => (
          <Grid key={category.id} item xs={1} sm={1} md={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Category
                groupedTimeLogsWithDateSorted={groupedTimeLogsWithDateSorted}
                user={user}
                checkActiveDateCorrectness={checkActiveDateCorrectness}
                timeLogsWithinActiveDate={timeLogsWithinActiveDate}
                setTimeLogsWithinActiveDate={setTimeLogsWithinActiveDate}
                controlValue={controlValue}
                setControlValue={setControlValue}
                disableHover={disableHover}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                category={category}
                categories={categories}
                setCategories={setCategories}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
              />
              <CategoryNotesCards
                controlValue={controlValue}
                setControlValue={setControlValue}
                disableHover={disableHover}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                category={category}
                categories={categories}
                setCategories={setCategories}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                user={user}
              />
            </Box>
          </Grid>
        ))}
        <Grid key={'new category'} item xs={1} sm={1} md={1}>
          <AddNew
            controlValue={controlValue}
            setControlValue={setControlValue}
            disableHover={disableHover}
            data={undefined}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            categories={categories}
            setCategories={setCategories}
            category={undefined}
          />
        </Grid>
      </Grid>
    </>
  );
}
