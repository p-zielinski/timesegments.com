import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import ShopProductCard from './ProductCard';

// ----------------------------------------------------------------------

ProductList.propTypes = {
  products: PropTypes.array.isRequired,
};

const categories = [
  {
    id: 'clbfiuyw50004qtzdy6xp335v',
    name: '1st category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: false,
    visible: true,
    createdAt: '2022-12-08T20:18:42.342Z',
    updatedAt: '2022-12-11T20:49:46.085Z',
    subcategories: [
      {
        id: 'clbjsqt720002qtasptzlc7ga',
        name: '2nd sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:06:29.198Z',
        updatedAt: '2022-12-11T20:06:29.198Z',
      },
      {
        id: 'clbfivfp00005qtzdhj48v115',
        name: '1st sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-08T20:19:04.117Z',
        updatedAt: '2022-12-11T20:49:46.088Z',
      },
      {
        id: 'clbjsqt720002qtasptzlc7ga1',
        name: '2nd sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:06:29.198Z',
        updatedAt: '2022-12-11T20:06:29.198Z',
      },
      {
        id: 'clbfivfp00005qtzdhj48v1151',
        name: '1st sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-08T20:19:04.117Z',
        updatedAt: '2022-12-11T20:49:46.088Z',
      },
    ],
  },
  {
    id: 'clbjspgtp0001qtas1ifh4aox',
    name: '2nd category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: false,
    visible: true,
    createdAt: '2022-12-11T20:05:26.510Z',
    updatedAt: '2022-12-13T21:44:36.083Z',
    subcategories: [
      {
        id: 'clbjsrhik0004qtasdzx3kp10',
        name: '1st sub->2nd category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbjspgtp0001qtas1ifh4aox',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:07:00.716Z',
        updatedAt: '2022-12-11T20:50:18.594Z',
      },
      {
        id: 'clbjsrjsd0006qtasyu656dgx',
        name: '2nd sub->2nd category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbjspgtp0001qtas1ifh4aox',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:07:03.661Z',
        updatedAt: '2022-12-13T21:44:36.083Z',
      },
    ],
  },
];

export default function ProductList({ products, ...other }) {
  const gridForSubcategory = (subcategory) => {
    return (
      <Grid key={subcategory.id} item xs={11} sm={2} md={4}>
        <ShopProductCard product={subcategory} />
      </Grid>
    );
  };

  return (
    <Grid container spacing={2} {...other} columns={20}>
      {categories.map((category) => (
        <>
          <Grid key={category.id} item xs={20} sm={16} md={11}>
            <ShopProductCard product={category} />
          </Grid>
          <Grid key={category.id + 1} item xs={20} sm={20} md={20}>
            <Grid container spacing={2} {...other} sx={{pl:10}}>
              {category.subcategories?.map((subcategory) => {
                return (
                  <Grid key={subcategory.id} item xs={12} sm={6} md={4}>
                    <ShopProductCard product={subcategory} />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </>
      ))}
    </Grid>
  );
}
