import PropTypes from 'prop-types';
// @mui
import { Card, Typography, Stack } from '@mui/material';
// utils
import IsActive from '../../../components/is-active/IsActive';
import { ACTIVE, INACTIVE } from '../../../consts/colors';
import { getRGBA } from '../../../utils/getRGBA';
import { getRepeatingLinearGradient } from '../../../utils/getRepeatingLinearGradient';

// ----------------------------------------------------------------------

SubcategoryCard.propTypes = {
  subcategory: PropTypes.object,
  categories: PropTypes.object,
  setCategories: PropTypes.func,
};

export default function SubcategoryCard({
  subcategory,
  categories,
  setCategories,
}) {
  const { name, active: isActive, id } = subcategory;
  const category = categories.find((category) =>
    category.subcategories.find(
      (_subcategory) => _subcategory.id === subcategory.id
    )
  );

  return (
    <Card
      key={id}
      sx={{
        background: isActive
          ? getRGBA(subcategory?.hexColor || category?.hexColor, 0.3)
          : getRepeatingLinearGradient(
              subcategory?.hexColor || category?.hexColor,
              0.3
            ),
        border: isActive ? `solid 2px ${ACTIVE}` : `solid 2px ${INACTIVE}`,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        cursor: 'pointer',
        '&:hover': {
          background: isActive ? INACTIVE : ACTIVE,
          border: !isActive ? `solid 2px ${ACTIVE}` : `solid 2px ${INACTIVE}`,
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
