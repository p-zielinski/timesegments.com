import { useEffect, useState } from 'react';
// @mui
import { Menu, Button, MenuItem, Typography } from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import { ColumnSortOption } from '@test1/shared';
import capitalize from 'capitalize';
import { sortCategories } from '../../../utils/sortCategories';

// ----------------------------------------------------------------------

const SORT_BY_OPTIONS = [
  {
    value: ColumnSortOption.ALPHABETICAL,
    label: capitalize(ColumnSortOption.ALPHABETICAL),
  },
  {
    value: ColumnSortOption.REVERSE_ALPHABETICAL,
    label: capitalize(ColumnSortOption.REVERSE_ALPHABETICAL),
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

export default function ShopProductSort({ categories, setCategories }) {
  const [sortOrder, setSortOrder] = useState(ColumnSortOption.NEWEST);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setCategories(sortCategories(categories, sortOrder));
  }, [sortOrder]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (option) => {
    setOpen(null);
    if (!option) {
      return;
    }
    setSortOrder(option.value);
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
            selected={option.value === setSortOrder}
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
