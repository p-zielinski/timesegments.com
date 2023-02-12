import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginOrRegisterDto } from './dto/loginOrRegister.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { UserDecorator } from '../../common/paramDecorators/user.decorator';
import { User } from '@prisma/client';
import { MeExtendedDto } from './dto/meExtendedDto';
import { MeExtendedOption } from '@test1/shared';
import { SetSortingCategoriesDto } from './dto/setSortingCategories';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async handleRequestCreateNewUser(
    @Body() loginOrRegisterDto: LoginOrRegisterDto
  ) {
    const { email, password } = loginOrRegisterDto;
    const registeringResult = await this.userService.createNewUser(
      { email, plainPassword: password },
      { generateToken: true }
    );
    if (registeringResult.success === false) {
      throw new BadRequestException({
        error: registeringResult.error,
      });
    }
    const { limits } = await this.userService.getMeExtended(
      registeringResult.user.id,
      [MeExtendedOption.CATEGORIES_LIMIT, MeExtendedOption.SUBCATEGORIES_LIMIT]
    );
    return {
      ...registeringResult,
      user: { ...registeringResult.user, categories: [] },
      limits,
    };
  }

  @Post('login')
  async handleRequestLogin(@Body() loginOrRegisterDto: LoginOrRegisterDto) {
    const { email, password } = loginOrRegisterDto;
    const validatingResult = await this.userService.validateUser({
      email,
      password,
    });
    if (validatingResult.success === false) {
      throw new BadRequestException({
        error: validatingResult.error,
      });
    }
    const { user, limits } = await this.userService.getMeExtended(
      validatingResult.user.id,
      [
        MeExtendedOption.CATEGORIES,
        MeExtendedOption.SUBCATEGORIES,
        MeExtendedOption.CATEGORIES_LIMIT,
        MeExtendedOption.SUBCATEGORIES_LIMIT,
      ]
    );
    return { ...validatingResult, user, limits };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async handleRequestGetMe(@UserDecorator() user: User) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me-extended')
  async handleRequestMeExtended(
    @UserDecorator() user: User,
    @Body() meExtendedDto: MeExtendedDto
  ) {
    const { extend } = meExtendedDto;
    return await this.userService.getMeExtended(user.id, extend);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set-sorting-categories')
  async handleRequestSetSortingCategories(
    @UserDecorator() user: User,
    @Body() setSortingCategoriesDto: SetSortingCategoriesDto
  ) {
    const { sortingCategories } = setSortingCategoriesDto;
    const updateSortingCategoriesStatus =
      await this.userService.setSortingCategories(user, sortingCategories);
    if (!updateSortingCategoriesStatus.success) {
      throw new BadRequestException({
        error: updateSortingCategoriesStatus.error,
      });
    }
    return updateSortingCategoriesStatus;
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel-all-active')
  async handleRequestCancelAllActive(@UserDecorator() user: User) {
    const cancelAllActiveStatus = await this.userService.cancelAllActive(user);
    if (cancelAllActiveStatus.success === false) {
      throw new BadRequestException({
        error: cancelAllActiveStatus.error,
      });
    }
    return cancelAllActiveStatus;
  }
}
