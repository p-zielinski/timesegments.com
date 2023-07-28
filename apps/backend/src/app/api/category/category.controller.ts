import {
  BadRequestException,
  Body,
  Controller,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/updateCategoryDto';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { SetCategoryActiveDto } from './dto/setCategoryActive.dto';
import { SetCategoryDeletedDto } from './dto/setCategoryDeleted.dto';
import { CheckUserControlValueGuard } from '../../common/check-control-values/checkUserControlValue.guard';
import { SetExpandCategoriesDto } from './dto/changeShowRecentNotes.dto';

@UseGuards(JwtAuthGuard, CheckUserControlValueGuard)
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post('set-show-recent-notes')
  async handleRequestSetExpandSubcategories(
    @UserDecorator() user: User,
    @Body() setExpandCategoriesDto: SetExpandCategoriesDto
  ) {
    const { categoryId, showRecentNotes } = setExpandCategoriesDto;
    const updateCategoryStatus =
      await this.categoryService.updateCategoryShowRecentNotes(
        categoryId,
        showRecentNotes,
        user
      );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
      });
    }
    return updateCategoryStatus;
  }

  @SetMetadata('checkControlValues', [
    UserRole.ADMIN,
    UserRole.INVESTMENT_MANAGER,
  ])
  @UseGuards(RolesGuard)
  @Post('create')
  async handleRequestCreateCategory(
    @UserDecorator() user: User,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    const { name, color } = createCategoryDto;
    const createCategoryStatus = await this.categoryService.createCategory(
      user,
      name,
      color
    );
    if (!createCategoryStatus.success) {
      throw new BadRequestException({
        error: createCategoryStatus.error,
      });
    }
    return createCategoryStatus;
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

  @Post('update')
  async handleRequestUpdateCategory(
    @UserDecorator() user: User,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const { categoryId, name, color } = updateCategoryDto;
    const updateCategoryStatus = await this.categoryService.updateCategory(
      categoryId,
      name,
      color,
      user
    );
    if (!updateCategoryStatus.success) {
      throw new BadRequestException({
        error: updateCategoryStatus.error,
      });
    }
    return updateCategoryStatus;
  }

  @Post('set-as-deleted')
  async handleRequestSetCategoryAsDeleted(
    @UserDecorator() user: User,
    @Body() setCategoryDeletedDto: SetCategoryDeletedDto
  ) {
    const { categoryId } = setCategoryDeletedDto;
    const setCategoryAsDeletedStatus =
      await this.categoryService.setCategoryAsDeleted(categoryId, user);
    if (!setCategoryAsDeletedStatus.success) {
      throw new BadRequestException({
        error: setCategoryAsDeletedStatus.error,
      });
    }
    return setCategoryAsDeletedStatus;
  }
}
