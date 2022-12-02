import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { RenameCategoryDto } from './dto/renameCategory.dto';
import { DisableCategoryDto } from './dto/disableCategory.dto';
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

  @Post('disable')
  async handleRequestDisableCategory(
    @UserDecorator() user: User,
    @Body() disableCategoryDto: DisableCategoryDto
  ) {
    const { categoryId } = disableCategoryDto;
    await this.categoryService.disableCategory(categoryId, user);
    return undefined;
  }

  @Post('rename')
  async handleRequestRenameCategory(
    @Body() renameCategoryDto: RenameCategoryDto
  ) {
    const { categoryId, name } = renameCategoryDto;
    return undefined;
  }
}
