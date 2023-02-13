import {useEffect, useState} from 'react';
// @mui
import {Button, Menu, MenuItem, Typography} from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import {CategoryWithSubcategories, ColumnSortOption} from '@test1/shared';
import capitalize from 'capitalize';
import {sortCategories} from '../../../utils/sortCategories';
import {User} from '@prisma/client';
import {handleFetch} from '../../../utils/handleFetch';

// ----------------------------------------------------------------------

const SORT_BY_OPTIONS = [
  {
    value: ColumnSortOption.ALPHABETICAL,
    label: capitalize(ColumnSortOption.ALPHABETICAL),
  },
  {
    value: ColumnSortOption.REVERSE_ALPHABETICAL,
    label: capitalize(ColumnSortOption.REVERSE_ALPHABETICAL).replaceAll(
      '_',
      ' '
    ),
  },
  {
    value: ColumnSortOption.NEWEST,
    label: capitalize(ColumnSortOption.NEWEST),
  },
  {
    value: ColumnSortOption.OLDEST,
    label: capitalize(ColumnSortOption.OLDEST),
  },
];

export default function Sort({
  user,
  categories,
  setCategories,
}: {
  user: User;
  categories: CategoryWithSubcategories[];
  setCategories: (categories: CategoryWithSubcategories[]) => unknown;
}) {
  const [sortOrder, setSortOrder] = useState(
    (user.sortingCategories as ColumnSortOption) ?? ColumnSortOption.NEWEST
  );
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setCategories(sortCategories(categories, sortOrder));
  }, [
    sortOrder,
    //this gets current state of categories and subcategories names
    categories
      .map((category) => {
        return [
          category.name,
          ...(category.subcategories ?? []).map(
            (subcategory) => subcategory.name
          ),
        ].join(',');
      })
      .join(','),
    user?.id,
  ]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (option?: any) => {
    setOpen(null);
    if (!option) {
      return;
    }

    setSortOrder(option.value);
    setUsersSortingCategories(option.value); //don't wait
  };

  const setUsersSortingCategories = async (option: ColumnSortOption) => {
    await handleFetch({
      pathOrUrl: 'user/set-sorting-categories',
      body: { sortingCategories: option },
      method: 'POST',
    });
  };

  return (
    <>
      <Button
        color="inherit"
        disableRipple
        onClick={handleOpen}
        endIcon={
          <Iconify
            icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
          />
        }
      >
        Sort By:&nbsp;
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ color: 'text.secondary' }}
        >
          {SORT_BY_OPTIONS.find((option) => option.value === sortOrder).label}
        </Typography>
      </Button>
      <Menu
        keepMounted
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => handleClose()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {SORT_BY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === sortOrder}
            onClick={() => handleClose(option)}
            sx={{ typography: 'body2' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
