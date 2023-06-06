import {
  BadRequestException,
  Body,
  Controller,
  Post,
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
import { CheckControlValueGuard } from '../../common/check-control-value/checkControlValue.guard';
import { UserService } from '../user/user.service';
import { SetExpandSubcategoriesDto } from './dto/changeShowRecentNotes.dto';

@UseGuards(JwtAuthGuard, CheckControlValueGuard)
@Controller('category')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  @Post('set-show-recent-notes')
  async handleRequestSetExpandSubcategories(
    @UserDecorator() user: User,
    @Body() setExpandSubcategoriesDto: SetExpandSubcategoriesDto
  ) {
    const { categoryId, showRecentNotes } = setExpandSubcategoriesDto;
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
    return {
      ...updateCategoryStatus,
      controlValue: this.userService.getNewControlValue(user),
    };
  }

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
    return {
      ...createCategoryStatus,
      controlValue: this.userService.getNewControlValue(user),
    };
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
    return {
      ...updateCategoryStatus,
      controlValue: this.userService.getNewControlValue(user),
    };
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
    return {
      ...updateCategoryStatus,
      controlValue: this.userService.getNewControlValue(user),
    };
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
    return {
      ...setCategoryAsDeletedStatus,
      controlValue: this.userService.getNewControlValue(user),
    };
  }
}
