import {useEffect, useState} from 'react';
// @mui
import {Button, Menu, MenuItem, Typography} from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import {CategoriesSortOption} from '@test1/shared';
import capitalize from 'capitalize';
import {sortCategories} from '../../../utils/sortCategories';
import {handleFetch} from '../../../utils/fetchingData/handleFetch';
import {StatusCodes} from 'http-status-codes';
import {StoreApi, UseBoundStore} from 'zustand/esm';
import {State} from '../../../hooks/useStore';

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
  useStore,
}: {
  useStore: UseBoundStore<StoreApi<State>>;
}) {
  const {
    isSaving,
    setIsSaving,
    user,
    categories,
    setCategories,
    controlValues,
    setControlValues,
    handleIncorrectControlValues,
  } = useStore();

  const [sortOrder, setSortOrder] = useState(
    (user.sortingCategories as CategoriesSortOption) ??
      CategoriesSortOption.NEWEST
  );
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setCategories(sortCategories(categories, sortOrder));
  }, [sortOrder, categories, user?.id]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = async (option?: any) => {
    setOpen(null);
    if (!option || isSaving) {
      return;
    }
    await setUsersSortingCategories(option.value); //don't wait
  };

  const setUsersSortingCategories = async (option: CategoriesSortOption) => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'user/set-sorting-categories',
      body: { sortingCategories: option, controlValues },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED) {
      setSortOrder(option);
      if (response.controlValues) {
        setControlValues({ ...controlValues, ...response.controlValues });
      }
    } else if (
      response.statusCode === StatusCodes.CONFLICT &&
      response.typesOfControlValuesWithIncorrectValues?.length > 0
    ) {
      handleIncorrectControlValues(
        response.typesOfControlValuesWithIncorrectValues
      );
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
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
