import {useEffect, useState} from 'react'; // @mui
import {Button, Menu, MenuItem, Typography} from '@mui/material'; // component
import Iconify from '../../../components/iconify';
import {NotesSortOption} from '@test1/shared';
import capitalize from 'capitalize';
import {sortNotes} from '../../../utils/sortNotes';
import {handleFetch} from '../../../utils/handleFetch'; // ----------------------------------------------------------------------

// ----------------------------------------------------------------------

const SORT_BY_OPTIONS = [
  {
    value: NotesSortOption.BY_DATE,
    label: capitalize(NotesSortOption.BY_DATE).replaceAll('_', ' '),
  },
  {
    value: NotesSortOption.FAVORITES_FIRST,
    label: capitalize(NotesSortOption.FAVORITES_FIRST).replaceAll('_', ' '),
  },
];

export default function SortNotes({ user, notes, setNotes }) {
  const [sortOrder, setSortOrder] = useState(
    (user.sortingNotes as NotesSortOption) ?? NotesSortOption.BY_DATE
  );
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setNotes(() => sortNotes(notes, sortOrder));
  }, [
    sortOrder,
    //this gets current state of categories and subcategories names
    notes?.map((note) => note?.id).join(','),
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

  const setUsersSortingCategories = async (option: NotesSortOption) => {
    await handleFetch({
      pathOrUrl: 'user/set-sorting-notes',
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
        Sort notes:&nbsp;
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
