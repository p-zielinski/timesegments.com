import PropTypes from 'prop-types';
// @mui
import { Grid } from '@mui/material';
import CategoryCard from './CategoryCard';
import { useState } from 'react';

// ----------------------------------------------------------------------

CategoryList.propTypes = {
  products: PropTypes.array.isRequired,
};

const categoriesCONST = [
  {
    id: 'category 1',
    name: '1st category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: false,
    visible: true,
    createdAt: '2022-12-08T20:18:42.342Z',
    updatedAt: '2022-12-11T20:49:46.085Z',
    subcategories: [
      {
        id: '2clbjsqt720fsafas002qtasptzlc7ga',
        name: '2nd sub->1st category11',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:06:29.198Z',
        updatedAt: '2022-12-11T20:06:29.198Z',
      },
      {
        id: '3clbfivfsafasffp00005qtzdhj48v115',
        name: '1st sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-08T20:19:04.117Z',
        updatedAt: '2022-12-11T20:49:46.088Z',
      },
      {
        id: '4dsadafasclbjsqt720002qtasptzlc7ga1',
        name: '3nd sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:06:29.198Z',
        updatedAt: '2022-12-11T20:06:29.198Z',
      },
      {
        id: 'csdadsa5lbfivfp00005qtzdhj48v1151',
        name: '4t sub->1st category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbfiuyw50004qtzdy6xp335v',
        active: false,
        visible: true,
        createdAt: '2022-12-08T20:19:04.117Z',
        updatedAt: '2022-12-11T20:49:46.088Z',
      },
    ],
    expandSubcategories: true,
  },
  {
    id: 'category 2',
    name: '2nd category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: true,
    visible: true,
    createdAt: '2022-12-11T20:05:26.510Z',
    updatedAt: '2022-12-13T21:44:36.083Z',
    subcategories: [
      {
        id: '7clbjsrhik0004qtasdzx3kp10',
        name: '1st sub->2nd category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbjspgtp0001qtas1ifh4aox',
        active: false,
        visible: true,
        createdAt: '2022-12-11T20:07:00.716Z',
        updatedAt: '2022-12-11T20:50:18.594Z',
      },
      {
        id: 'c8lbjsrjsd0006qtasyu656dgx',
        name: '2nd sub->2nd category',
        userId: 'clbfishnl0000qtzdief9a8mb',
        categoryId: 'clbjspgtp0001qtas1ifh4aox',
        active: true,
        visible: true,
        createdAt: '2022-12-11T20:07:03.661Z',
        updatedAt: '2022-12-13T21:44:36.083Z',
      },
    ],
    hexColor: '00A30F',
    expandSubcategories: true,
  },
  {
    id: 'category 3',
    name: '3rd category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: false,
    visible: true,
    createdAt: '2022-12-11T20:05:26.510Z',
    updatedAt: '2022-12-13T21:44:36.083Z',
    subcategories: [],
    hexColor: '0044a3',
    expandSubcategories: true,
  },
  {
    id: `category 4`,
    name: '4th category',
    userId: 'clbfishnl0000qtzdief9a8mb',
    active: false,
    visible: true,
    createdAt: '2022-12-11T20:05:26.510Z',
    updatedAt: '2022-12-13T21:44:36.083Z',
    subcategories: [],
    expandSubcategories: true,
  },
];

export default function CategoryList({ products, ...other }) {
  const [categories, setCategories] = useState(categoriesCONST || []);
  return (
    <Grid container spacing={2} {...other} columns={1}>
      {categories.map((category) => (
        <Grid key={category.id} item xs={1} sm={1} md={1}>
          <CategoryCard
            category={category}
            categories={categories}
            setCategories={setCategories}
          />
        </Grid>
      ))}
    </Grid>
  );
}
