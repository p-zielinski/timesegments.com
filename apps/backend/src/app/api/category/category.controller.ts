import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/updateCategoryDto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { SetCategoryActiveDto } from './dto/setCategoryActive.dto';
import { SetCategoryDeletedDto } from './dto/setCategoryDeleted.dto';
import { SetExpandCategoriesDto } from './dto/changeShowRecentNotes.dto';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';
import { ControlValue } from '@test1/shared';
import { ImportantControlValuesDecorator } from '../../common/param-decorators/importantControlValues';
import { ResponseService } from '../response/response.service';

@UseGuards(JwtAuthGuard)
@Controller('category')
export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private responseService: ResponseService
  ) {}

  @Post('set-show-recent-notes')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.CATEGORIES])
  @UseGuards(ControlValuesGuard)
  async handleRequestSetExpandSubcategories(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() setExpandCategoriesDto: SetExpandCategoriesDto
  ) {
    const { categoryId, showRecentNotes } = setExpandCategoriesDto;
    const updateCategoryStatus =
      await this.categoryService.updateCategoryShowRecentNotes(
        categoryId,
        showRecentNotes,
        user
      );
    return await this.responseService.returnProperResponse(
      updateCategoryStatus,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }

  @Post('create')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.CATEGORIES])
  @UseGuards(ControlValuesGuard)
  async handleRequestCreateCategory(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    const { name, color } = createCategoryDto;
    const createCategoryStatus = await this.categoryService.createCategory(
      user,
      name,
      color
    );
    return await this.responseService.returnProperResponse(
      createCategoryStatus,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }

  @Post('set-active')
  @SetMetadata('typesOfControlValuesToCheck', [
    ControlValue.CATEGORIES,
    ControlValue.TIME_LOGS,
  ])
  @UseGuards(ControlValuesGuard)
  async handleRequestSetCategoryActive(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() setCategoryActiveDto: SetCategoryActiveDto
  ) {
    const { categoryId } = setCategoryActiveDto;
    const updateCategoryStatus = await this.categoryService.setCategoryActive(
      categoryId,
      user
    );
    return await this.responseService.returnProperResponse(
      updateCategoryStatus,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }

  @Post('update')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.CATEGORIES])
  @UseGuards(ControlValuesGuard)
  async handleRequestUpdateCategory(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    const { categoryId, name, color } = updateCategoryDto;
    const updateCategoryStatus = await this.categoryService.updateCategory(
      categoryId,
      name,
      color,
      user
    );
    return await this.responseService.returnProperResponse(
      updateCategoryStatus,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }

  @Post('set-as-deleted')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.CATEGORIES])
  @UseGuards(ControlValuesGuard)
  async handleRequestSetCategoryAsDeleted(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() setCategoryDeletedDto: SetCategoryDeletedDto
  ) {
    const { categoryId } = setCategoryDeletedDto;
    const setCategoryAsDeletedStatus =
      await this.categoryService.setCategoryAsDeleted(categoryId, user);
    return await this.responseService.returnProperResponse(
      setCategoryAsDeletedStatus,
      {
        userId: user.id,
        importantControlValues,
      }
    );
  }
}
