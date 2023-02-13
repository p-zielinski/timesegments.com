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
import { UpdateSubcategoryDto } from './dto/updateSubcategoryDto';
import { CreateSubcategoryDto } from './dto/createSubcategory.dto';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { ChangeVisibilitySubcategoryDto } from './dto/changeVisibilitySubcategory.dto';
import { SetSubcategoryActiveDto } from './dto/setSubcategoryActive.dto';
import { SetSubcategoryDeletedDto } from './dto/setSubcategoryDeleted.dto';

@UseGuards(JwtAuthGuard)
@Controller('subcategory')
export class SubcategoryController {
  constructor(private subcategoryService: SubcategoryService) {}

  @Post('create')
  async handleRequestCreateSubcategory(
    @UserDecorator() user: User,
    @Body() createSubcategoryDto: CreateSubcategoryDto
  ) {
    const { categoryId, name, color } = createSubcategoryDto;
    const createCategoryStatus =
      await this.subcategoryService.createSubcategory(
        user,
        categoryId,

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
    if (updateSubcategoryStatus.success === false) {
      throw new BadRequestException({
        error: updateSubcategoryStatus.error,
      });
    }
    return updateSubcategoryStatus;
  }

  @Post('update')
  async handleRequestUpdateSubcategory(
    @UserDecorator() user: User,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto
  ) {
    const { subcategoryId, name, color } = updateSubcategoryDto;
    const updateSubcategoryStatus =
      await this.subcategoryService.updateSubcategory(
        user,
        subcategoryId,
        name,
        color
      );
    if (!updateSubcategoryStatus.success) {
      throw new BadRequestException({
        error: updateSubcategoryStatus.error,
      });
    }
    return updateSubcategoryStatus;
  }

  @Post('set-as-deleted')
  async handleRequestSetSubcategoryAsDeleted(
    @UserDecorator() user: User,
    @Body() setSubcategoryDeletedDto: SetSubcategoryDeletedDto
  ) {
    const { subcategoryId } = setSubcategoryDeletedDto;
    const setSubcategoryAsDeletedStatus =
      await this.subcategoryService.setSubcategoryAsDeleted(
        subcategoryId,
        user
      );
    if (!setSubcategoryAsDeletedStatus.success) {
      throw new BadRequestException({
        error: setSubcategoryAsDeletedStatus.error,
      });
    }
    return setSubcategoryAsDeletedStatus;
  }
}
