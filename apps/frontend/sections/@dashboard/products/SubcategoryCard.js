import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// utils
import IsActive from '../../../components/is-active/IsActive';

// ----------------------------------------------------------------------

SubcategoryCard.propTypes = {
  subcategory: PropTypes.object,
};

export default function SubcategoryCard({ subcategory }) {
  const { name, active: isActive, id } = subcategory;

  return (
    <Card
      key={id}
      sx={{
        bgcolor: subcategory.active
          ? 'rgba(0,133,9,0.15)'
          : 'rgba(255,0,0,0.13)',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        cursor: 'pointer',
        '&:hover': {
          background: subcategory.active
            ? 'rgba(255,0,0,0.2)'
            : 'rgba(0,133,9,0.25)',
        },
      }}
    >
      <Stack
        spacing={1}
        sx={{ p: 3 }}
        direction="row"
        alignItems="center"
        justifyContent="left"
      >
        <IsActive isActive={isActive} />
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>
      </Stack>
    </Card>
  );
}
