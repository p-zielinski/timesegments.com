import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// utils
import IsActive from '../../../components/is-active/IsActive';
import {ACTIVE,INACTIVE} from "../../../consts/colors";

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
        border: subcategory.active
          ? `solid 2px ${ACTIVE}`
          : `solid 2px ${INACTIVE}`,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        cursor: 'pointer',
        '&:hover': {
          background: subcategory.active
            ? INACTIVE
            : ACTIVE,
          border: !subcategory.active
            ? `solid 2px ${ACTIVE}`
            : `solid 2px ${INACTIVE}`
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
