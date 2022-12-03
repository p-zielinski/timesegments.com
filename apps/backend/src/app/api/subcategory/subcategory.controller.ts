import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from '../category/category.service';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';
import { CreateCategoryDto } from '../category/dto/createCategory.dto';
import { ChangeVisibilityCategoryDto } from '../category/dto/changeVisibilityCategory.dto';
import { RenameCategoryDto } from '../category/dto/renameCategory.dto';
import { SubcategoryService } from './subcategory.service';
import { RenameSubcategoryDto } from './dto/renameSubcategory.dto';
import { CreateSubcategoryDto } from './dto/createSubcategory.dto';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  @Post('create')
  async handleRequestCreateCategory(
    @UserDecorator() user: User,
    @Body() createSubcategoryDto: CreateSubcategoryDto
  ) {
    const { name, categoryId } = createSubcategoryDto;
    const createCategoryStatus =
      await this.subcategoryService.createSubcategory(name, categoryId, user);
    if (!createCategoryStatus.success) {
      throw new BadRequestException({
        error: createCategoryStatus.error,
        statusCode: 400,
      });
    }
    return createCategoryStatus.category;
  }

  @Post('change-visibility')
  async handleRequestDisableCategory(
    @UserDecorator() user: User,
    @Body() changeVisibilityCategoryDto: ChangeVisibilityCategoryDto
  ) {
    const { subcategoryId, visible } = changeVisibilityCategoryDto;
    const updateCategoryStatus =
      await this.subcategoryService.updateVisibilitySubcategory(
        subcategoryId,
        visible,
        user
      );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
        statusCode: 400,
      });
    }
    return updateCategoryStatus.category;
  }

  @Post('rename')
  async handleRequestRenameCategory(
    @UserDecorator() user: User,
    @Body() renameSubcategoryDto: RenameSubcategoryDto
  ) {
    const { subcategoryId, name } = renameSubcategoryDto;
    const updateCategoryStatus =
      await this.subcategoryService.updateNameSubcategory(
        subcategoryId,
        name,
        user
      );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
        statusCode: 400,
      });
    }
    return updateCategoryStatus.category;
  }
}
