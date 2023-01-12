import { useState } from 'react';
// @mui
import { Menu, Button, MenuItem, Typography } from '@mui/material';
// component
import Iconify from '../../../components/iconify';
import { ColumnSortOptions } from '../../../enums/sortOption';
import capitalize from 'capitalize';

// ----------------------------------------------------------------------

const SORT_BY_OPTIONS = [
  {
    value: ColumnSortOptions.ALPHABETICAL,
    label: capitalize(ColumnSortOptions.ALPHABETICAL),
  },
  {
    value: ColumnSortOptions.REVERSE_ALPHABETICAL,
    label: capitalize(ColumnSortOptions.REVERSE_ALPHABETICAL),
  },
  {
    value: ColumnSortOptions.NEWEST,
    label: capitalize(ColumnSortOptions.NEWEST),
  },
  {
    value: ColumnSortOptions.OLDEST,
    label: capitalize(ColumnSortOptions.OLDEST),
  },
];

export default function ShopProductSort({ order, setOrder }) {
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (option) => {
    setOpen(null);
    if (!option) {
      return;
    }
    setOrder(option.value);
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
          {SORT_BY_OPTIONS.find((option) => option.value === order).label}
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
            selected={option.value === order}
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
