import {useEffect, useState} from 'react';
// @mui
import {Button, Menu, MenuItem, Typography} from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import {CategoriesSortOption, CategoryWithSubcategories} from '@test1/shared';
import capitalize from 'capitalize';
import {sortCategories} from '../../../utils/sortCategories';
import {User} from '@prisma/client';
import {handleFetch} from '../../../utils/handleFetch';

// ----------------------------------------------------------------------

const SORT_BY_OPTIONS = [
  {
    value: CategoriesSortOption.ALPHABETICAL,
    label: capitalize(CategoriesSortOption.ALPHABETICAL),
  },
  {
    value: CategoriesSortOption.REVERSED_ALPHABETICAL,
    label: capitalize(CategoriesSortOption.REVERSED_ALPHABETICAL).replaceAll(
      '_',
      ' '
    ),
  },
  {
    value: CategoriesSortOption.NEWEST,
    label: capitalize(CategoriesSortOption.NEWEST),
  },
  {
    value: CategoriesSortOption.OLDEST,
    label: capitalize(CategoriesSortOption.OLDEST),
  },
];

export default function SortCategories({
                                         user,
                                         categories,
                                         setCategories,
                                       }: {
  user: User;
  categories: CategoryWithSubcategories[];
  setCategories: (categories: CategoryWithSubcategories[]) => unknown;
}) {
  const [sortOrder, setSortOrder] = useState(
    (user.sortingCategories as CategoriesSortOption) ??
    CategoriesSortOption.NEWEST
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

  const setUsersSortingCategories = async (option: CategoriesSortOption) => {
    await handleFetch({
      pathOrUrl: 'user/set-sorting-categories',
      body: {sortingCategories: option},
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
        Sort categories by:&nbsp;
        <Typography
          component="span"
          variant="subtitle2"
          sx={{color: 'text.secondary'}}
        >
          {SORT_BY_OPTIONS.find((option) => option.value === sortOrder).label}
        </Typography>
      </Button>
      <Menu
        keepMounted
        anchorEl={open}
        open={Boolean(open)}
        onClose={() => handleClose()}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        {SORT_BY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === sortOrder}
            onClick={() => handleClose(option)}
            sx={{typography: 'body2'}}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
