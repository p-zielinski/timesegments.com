import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';
import { SubcategoryService } from './subcategory.service';
import { RenameSubcategoryDto } from './dto/renameSubcategory.dto';
import { CreateSubcategoryDto } from './dto/createSubcategory.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ChangeVisibilitySubcategoryDto } from './dto/changeVisibilitySubcategory.dto';
import { SetSubcategoryActiveDto } from './setSubcategoryActive.dto';

@UseGuards(JwtAuthGuard)
@Controller('subcategory')
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  @Post('create')
  async handleRequestCreateSubcategory(
    @UserDecorator() user: User,
    @Body() createSubcategoryDto: CreateSubcategoryDto
  ) {
    const { name, categoryId } = createSubcategoryDto;
    const createCategoryStatus =
      await this.subcategoryService.createSubcategory(name, categoryId, user);
    if (!createCategoryStatus.success) {
      throw new BadRequestException({
        error: createCategoryStatus.error,
      });
    }
    return createCategoryStatus;
  }

  @Post('change-visibility')
  async handleRequestDisableSubcategory(
    @UserDecorator() user: User,
    @Body() changeVisibilitySubcategoryDto: ChangeVisibilitySubcategoryDto
  ) {
    const { subcategoryId, visible } = changeVisibilitySubcategoryDto;
    const updateCategoryStatus =
      await this.subcategoryService.updateVisibilitySubcategory(
        subcategoryId,
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
    @Body() setSubcategoryActiveDto: SetSubcategoryActiveDto
  ) {
    const { subcategoryId } = setSubcategoryActiveDto;
    const updateSubcategoryStatus =
      await this.subcategoryService.setSubcategoryActive(subcategoryId, user);
    if (!updateSubcategoryStatus.success) {
      throw new BadRequestException({
        error: updateSubcategoryStatus.error,
      });
    }
    return updateSubcategoryStatus;
  }

  @Post('rename')
  async handleRequestRenameSubcategory(
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
      });
    }
    return updateCategoryStatus;
  }
}
