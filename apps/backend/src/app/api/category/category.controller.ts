import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { RenameCategoryDto } from './dto/renameCategory.dto';
import { ChangeVisibilityCategoryDto } from './dto/changeVisibilityCategory.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';

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
    return await this.categoryService.createCategory(name, user);
  }

  @Post('change-visibility')
  async handleRequestDisableCategory(
    @UserDecorator() user: User,
    @Body() changeVisibilityCategoryDto: ChangeVisibilityCategoryDto
  ) {
    const { categoryId, visible } = changeVisibilityCategoryDto;
    return await this.categoryService.updateVisibilityCategory(
      categoryId,
      visible,
      user
    );
  }

  @Post('rename')
  async handleRequestRenameCategory(
    @Body() renameCategoryDto: RenameCategoryDto
  ) {
    const { categoryId, name } = renameCategoryDto;
    return undefined;
  }
}
