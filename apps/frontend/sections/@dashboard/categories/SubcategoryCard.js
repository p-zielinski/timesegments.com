import PropTypes from 'prop-types';
// @mui
import {Box, Card, Stack, Typography} from '@mui/material';
// utils
import {GREEN, IS_SAVING_HEX, LIGHT_GREEN, LIGHT_RED, LIGHT_SILVER, RED, SUPER_LIGHT_SILVER,} from '../../../consts/colors';
import {getRepeatingLinearGradient} from '../../../utils/colors/getRepeatingLinearGradient';
import Iconify from '../../../components/iconify';
import {getHexFromRGBAObject} from '../../../utils/colors/getHexFromRGBAObject';
import {getRgbaObjectFromHexString} from '../../../utils/colors/getRgbaObjectFromHexString';
import {CategoriesPageMode} from '../../../enum/categoriesPageMode';
import EditSubcategory from './EditSubcategory';
import {handleFetch} from '../../../utils/handleFetch';
import React from 'react';
import {getHexFromRGBAString} from '../../../utils/colors/getHexFromRGBString';
import {StatusCodes} from 'http-status-codes';

// ----------------------------------------------------------------------

SubcategoryCard.propTypes = {
  subcategory: PropTypes.object,
  categories: PropTypes.array,
  setCategories: PropTypes.func,
  isEditing: PropTypes.object,
};

export default function SubcategoryCard({
                                          controlValue,
                                          setControlValue,
                                          disableHover,
                                          subcategory,
                                          categories,
                                          setCategories,
                                          isEditing,
                                          setIsEditing,
                                          viewMode,
                                          isSaving,
                                          setIsSaving,
                                        }) {
  const {name, active: isActive} = subcategory;
  const category = categories.find((category) =>
    category.subcategories.find(
      (_subcategory) => _subcategory.id === subcategory.id
    )
  );

  const changeSubcategoryVisibility = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'subcategory/change-visibility',
      body: {
        subcategoryId: subcategory.id,
        visible: !subcategory.visible,
        controlValue,
      },
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.subcategory) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            if (subcategory.id === response.subcategory.id) {
              return response.subcategory;
            }
            return subcategory;
          });
          return {...category, subcategories};
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  const setSubcategoryAsActive = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'subcategory/set-active',
      body: {subcategoryId: subcategory.id, controlValue},
      method: 'POST',
    });
    if (
      response.statusCode === StatusCodes.CREATED &&
      response?.subcategory &&
      response?.category
    ) {
      setCategories(
        categories.map((category) => {
          const subcategories = category.subcategories.map((subcategory) => {
            if (subcategory.id === response.subcategory.id) {
              return response.subcategory;
            }
            subcategory.active = false;
            return subcategory;
          });
          if (category.id === response.category?.id) {
            return {...response.category, subcategories};
          }
          return {...category, active: false, subcategories};
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  const setSubcategoryAsDeleted = async () => {
    setIsSaving(true);
    const response = await handleFetch({
      pathOrUrl: 'subcategory/set-as-deleted',
      body: {subcategoryId: subcategory.id, controlValue},
      method: 'POST',
    });
    if (response.statusCode === StatusCodes.CREATED && response?.subcategory) {
      setCategories(
        categories.map((_category) => {
          if (_category.id === category.id) {
            return {
              ..._category,
              subcategories: _category.subcategories.filter(
                (_subcategory) => _subcategory.id !== subcategory.id
              ),
            };
          }
          return _category;
        })
      );
      if (response.controlValue) {
        setControlValue(response.controlValue);
      }
    } else if (response.statusCode === StatusCodes.CONFLICT) {
      setControlValue(undefined);
      return; //skip setting isSaving(false)
    }
    setIsSaving(false);
    return;
  };

  if (
    viewMode === CategoriesPageMode.EDIT &&
    isEditing.subcategoryId === subcategory.id
  ) {
    return (
      <EditSubcategory
        controlValue={controlValue}
        setControlValue={setControlValue}
        disableHover={disableHover}
        category={category}
        categories={categories}
        setCategories={setCategories}
        subcategory={subcategory}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
      />
    );
  }

  return (
    <Card>
      {isEditing.deleteSubcategory === subcategory.id ? (
        <Box sx={{display: 'flex'}}>
          <Box
            sx={{
              width: `60px`,
              minWidth: '60px',
              p: 2,
              color: isSaving ? IS_SAVING_HEX : GREEN,
              background: isSaving
                ? `white`
                : category.active
                  ? SUPER_LIGHT_SILVER
                  : 'white',
              border: `solid 2px ${LIGHT_SILVER}`,
              borderRight: `0px`,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              cursor: !isSaving && !category.active && 'pointer',
            }}
            onClick={() =>
              !isSaving &&
              setIsEditing({
                categoryId: undefined,
                subcategoryId: undefined,
                createNew: undefined,
                deleteCategory: undefined,
              })
            }
          >
            <Iconify
              icon={'mdi:cancel-bold'}
              width={38}
              sx={{
                m: -2,
                position: 'absolute',
                bottom: 35,
                left: 28,
              }}
            />
          </Box>
          <Box
            sx={{
              color: isSaving && IS_SAVING_HEX,
              background: isSaving
                ? SUPER_LIGHT_SILVER
                : viewMode === CategoriesPageMode.EDIT
                  ? getRepeatingLinearGradient(
                    isSaving ? IS_SAVING_HEX : getHexFromRGBAString(RED),
                    0.3,
                    45,
                    false
                  )
                  : isActive
                    ? LIGHT_GREEN
                    : LIGHT_RED,
              flex: 1,
              border: isSaving
                ? `solid 2px ${IS_SAVING_HEX}`
                : `solid 2px ${LIGHT_RED}`,
              borderLeft: 0,
              borderRight: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              cursor:
                !isSaving && viewMode === CategoriesPageMode.VIEW && 'pointer',
              '&:hover': !disableHover &&
                !isSaving &&
                viewMode === CategoriesPageMode.VIEW && {
                  border: isActive ? `solid 2px ${RED}` : `solid 2px ${GREEN}`,
                  borderLeft: 0,
                  borderRight: 0,
                },
            }}
            onClick={() => !isSaving && null}
          >
            <Stack
              spacing={1}
              sx={{p: 3}}
              direction="row"
              alignItems="center"
              justifyContent="left"
            >
              <Typography variant="subtitle3" noWrap>
                DELETE:{' '}
                <span
                  style={{fontWeight: 'bold', textDecoration: 'underline'}}
                >
                  {subcategory.name.toUpperCase()}
                </span>{' '}
                ?
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: `61px`,
              p: 2,
              color: isSaving ? IS_SAVING_HEX : RED,
              background: `white`,
              border: `solid 2px ${LIGHT_SILVER}`,
              borderLeft: `0px`,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              cursor: !isSaving && 'pointer',
              '&:hover': !disableHover &&
                !isSaving && {
                  borderLeft: `0px`,
                  borderColor: RED,
                },
            }}
            onClick={() => !isSaving && setSubcategoryAsDeleted()}
          >
            <Iconify
              icon={'material-symbols:delete-forever-rounded'}
              width={40}
              sx={{
                m: -2,
                position: 'absolute',
                bottom: 34,
                right: 27,
              }}
            />
          </Box>
        </Box>
      ) : (
        <>
          <Box sx={{display: 'flex'}}>
            {viewMode === CategoriesPageMode.EDIT && (
              <>
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color:
                      isSaving || subcategory.active
                        ? IS_SAVING_HEX
                        : subcategory.visible
                          ? GREEN
                          : RED,
                    background: isSaving
                      ? `white`
                      : subcategory.active
                        ? SUPER_LIGHT_SILVER
                        : 'white',
                    border: `solid 2px ${LIGHT_SILVER}`,
                    borderRight: `0px`,
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                    cursor: !isSaving && !subcategory.active && 'pointer',
                    '&:hover': !disableHover &&
                      !isSaving &&
                      !subcategory.active && {
                        color: !subcategory.visible ? GREEN : RED,
                      },
                  }}
                  onClick={() =>
                    !isSaving &&
                    !subcategory.active &&
                    changeSubcategoryVisibility()
                  }
                >
                  <Iconify
                    icon={
                      subcategory.visible
                        ? 'gridicons:visible'
                        : 'gridicons:not-visible'
                    }
                    width={40}
                    sx={{m: -2, position: 'absolute', bottom: 34, left: 27}}
                  />
                </Box>
                <Box
                  sx={{
                    width: `60px`,
                    minWidth: '60px',
                    p: 2,
                    color: isSaving
                      ? IS_SAVING_HEX
                      : subcategory.visible
                        ? GREEN
                        : RED,
                    background: `white`,
                    borderTop: `solid 2px ${LIGHT_SILVER}`,
                    borderBottom: `solid 2px ${LIGHT_SILVER}`,
                    cursor: !isSaving && 'pointer',
                    '&:hover': !disableHover &&
                      !isSaving && {
                        borderTop: `solid 2px ${
                          subcategory.visible ? LIGHT_SILVER : RED
                        }`,
                        borderBottom: `solid 2px ${
                          subcategory.visible ? LIGHT_SILVER : RED
                        }`,
                      },
                  }}
                  onClick={() => {
                    if (isSaving) {
                      return;
                    }
                    if (subcategory.visible) {
                      return setIsEditing({
                        subcategoryId: subcategory.id,
                      });
                    }
                    return setIsEditing({
                      deleteSubcategory: subcategory.id,
                    });
                  }}
                >
                  <Iconify
                    icon={
                      subcategory.visible
                        ? 'material-symbols:edit'
                        : 'material-symbols:delete-forever-rounded'
                    }
                    width={40}
                    sx={{m: -2, position: 'absolute', bottom: 34, left: 88}}
                  />
                </Box>
              </>
            )}
            {viewMode === CategoriesPageMode.VIEW && (
              <Box
                sx={{
                  width: `60px`,
                  minWidth: '60px',
                  p: 2,
                  background: isSaving
                    ? IS_SAVING_HEX
                    : getRepeatingLinearGradient(
                      subcategory?.color || category?.color,
                      0.3
                    ),
                  border: isSaving
                    ? `solid 2px ${IS_SAVING_HEX}`
                    : isActive
                      ? `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(
                          subcategory?.color || category?.color
                        ),
                        a: 0.3,
                      })}`
                      : `solid 2px ${getHexFromRGBAObject({
                        ...getRgbaObjectFromHexString(
                          subcategory?.color || category?.color
                        ),
                        a: 0.3,
                      })}`,
                  borderRight: 0,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                }}
              />
            )}
            <Box
              sx={{
                color: isSaving && IS_SAVING_HEX,
                background: isSaving
                  ? SUPER_LIGHT_SILVER
                  : viewMode === CategoriesPageMode.EDIT
                    ? getRepeatingLinearGradient(
                      isSaving
                        ? IS_SAVING_HEX
                        : subcategory?.color || category?.color,
                      0.3,
                      45,
                      false
                    )
                    : isActive
                      ? LIGHT_GREEN
                      : LIGHT_RED,
                flex: 1,
                border: isSaving
                  ? `solid 2px ${IS_SAVING_HEX}`
                  : viewMode === CategoriesPageMode.EDIT
                    ? `solid 2px ${
                      isSaving
                        ? IS_SAVING_HEX
                        : getHexFromRGBAObject({
                          ...getRgbaObjectFromHexString(
                            subcategory?.color || category?.color
                          ),
                          a: 0.3,
                        })
                    }`
                    : isActive
                      ? `solid 2px ${LIGHT_GREEN}`
                      : `solid 2px ${LIGHT_RED}`,
                borderLeft: 0,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                cursor:
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW &&
                  'pointer',
                '&:hover': !disableHover &&
                  !isSaving &&
                  viewMode === CategoriesPageMode.VIEW && {
                    border: isActive
                      ? `solid 2px ${RED}`
                      : `solid 2px ${GREEN}`,
                    borderLeft: 0,
                  },
              }}
              onClick={() =>
                !isSaving &&
                viewMode !== CategoriesPageMode.EDIT &&
                setSubcategoryAsActive()
              }
            >
              <Stack
                spacing={1}
                sx={{p: 3, pl: viewMode === CategoriesPageMode.EDIT ? 2 : 3}}
                direction="row"
                alignItems="center"
                justifyContent="left"
              >
                <Typography variant="subtitle2" noWrap>
                  {name}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}
