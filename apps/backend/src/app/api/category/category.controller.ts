import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { RenameCategoryDto } from './dto/renameCategory.dto';
import { ChangeVisibilityCategoryDto } from './dto/changeVisibilityCategory.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';
import { SetCategoryActiveDto } from './dto/setCategoryActive.dto';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('create')
  async handleRequestCreateCategory(
    @UserDecorator() user: User,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    const { name } = createCategoryDto;
    const createCategoryStatus = await this.categoryService.createCategory(
      name,
      user
    );
    if (!createCategoryStatus.success) {
      throw new BadRequestException({
        error: createCategoryStatus.error,
      });
    }
    return createCategoryStatus.category;
  }

  @Post('change-visibility')
  async handleRequestDisableCategory(
    @UserDecorator() user: User,
    @Body() changeVisibilityCategoryDto: ChangeVisibilityCategoryDto
  ) {
    const { categoryId, visible } = changeVisibilityCategoryDto;
    const updateCategoryStatus =
      await this.categoryService.updateVisibilityCategory(
        categoryId,
        visible,
        user
      );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
      });
    }
    return updateCategoryStatus;
  }

  @Post('set-active')
  async handleRequestSetCategoryActive(
    @UserDecorator() user: User,
    @Body() setCategoryActiveDto: SetCategoryActiveDto
  ) {
    const { categoryId } = setCategoryActiveDto;
    const updateCategoryStatus = await this.categoryService.setCategoryActive(
      categoryId,
      user
    );
    if (updateCategoryStatus.success === false) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
      });
    }
    return updateCategoryStatus;
  }

  @Post('rename')
  async handleRequestRenameCategory(
    @UserDecorator() user: User,
    @Body() renameCategoryDto: RenameCategoryDto
  ) {
    const { categoryId, name } = renameCategoryDto;
    const updateCategoryStatus = await this.categoryService.updateNameCategory(
      categoryId,
      name,
      user
    );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
      });
    }
    return updateCategoryStatus;
  }
}
