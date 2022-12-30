import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import { ColorPreview } from '../../../components/color-utils';



// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ product }) {
  const { name, cover, price, colors, status, priceSale } = product;

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        {status && (
          <Box
            sx={{
              zIndex: 9,
              top: 10,
              right: 10,
              position: 'absolute',
              ml: -0.75,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: (theme) => `solid 2px ${theme.palette.background.paper}`,
              boxShadow: (theme) =>
                `inset -1px 1px 2px ${alpha(theme.palette.common.black, 0.24)}`,
              bgcolor: `red`,
            }}
          />
        )}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover">
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Link>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <ColorPreview colors={colors} />
          <Typography variant="subtitle1">
            <Typography
              component="span"
              variant="body1"
              sx={{
                color: 'text.disabled',
                textDecoration: 'line-through',
              }}
            >
              {priceSale && fCurrency(priceSale)}
            </Typography>
            &nbsp;
            {fCurrency(price)}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
