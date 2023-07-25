import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginOrRegisterDto } from './dto/login.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { MeExtendedDto } from './dto/meExtendedDto';
import { MeExtendedOption } from '@test1/shared';
import { RegisterDto } from './dto/register.dto';
import { SetNameDto } from './dto/setName.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ChangeTimezoneDto } from './dto/changeTimezone.dto';
import { InitializeEmailChangeDto } from './dto/initializeEmailChange.dto';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';
import { SetSortingNotesDto } from './dto/setSortingNotes.dto';
import { SetSortingCategoriesDto } from './dto/setSortingCategories.dto';
import { ChangeEmailAddressDto } from './dto/changeEmailAddress.dto';
import { CheckUserControlValueGuard } from '../../common/check-control-values/checkUserControlValue.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('change-email-address')
  async changeEmailAddress(
    @UserDecorator() user: User,
    @Body() changeEmailAddressDto: ChangeEmailAddressDto
  ) {
    const { newEmail } = changeEmailAddressDto;
    const changeEmailAddressResult = await this.userService.changeEmailAddress(
      user,
      newEmail
    );
    if (changeEmailAddressResult.success === false) {
      throw new BadRequestException({
        error: changeEmailAddressResult.error,
      });
    }
    return changeEmailAddressResult;
  }

  @Post('register')
  async handleRequestCreateNewUser(
    @Body() registerDto: RegisterDto,
    @Headers('User-Agent') userAgent: string
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException({
        error: 'Registration is disabled',
      });
    }
    const { email, password, timezone } = registerDto;
    const registeringResult = await this.userService.createNewUser(
      { email, plainPassword: password, timezone, userAgent },
      { generateToken: true }
    );
    if (registeringResult.success === false) {
      throw new BadRequestException({
        error: registeringResult.error,
      });
    }
    const { limits } = await this.userService.getMeExtended(
      registeringResult.user,
      [
        MeExtendedOption.CATEGORIES,
        MeExtendedOption.CATEGORIES_LIMIT,
        MeExtendedOption.NOTES,
        MeExtendedOption.TODAYS_TIMELOGS,
      ]
    );
    return {
      ...registeringResult,
      user: { ...registeringResult.user, categories: [] },
      limits,
    };
  }

  @Post('login')
  async handleRequestLogin(
    @Body() loginOrRegisterDto: LoginOrRegisterDto,
    @Headers('User-Agent') userAgent: string
  ) {
    const { email, password } = loginOrRegisterDto;
    const validatingResult = await this.userService.validateUser({
      email,
      password,
      userAgent,
    });
    if (validatingResult.success === false) {
      throw new BadRequestException({
        error: validatingResult.error,
      });
    }
    const { user, limits } = await this.userService.getMeExtended(
      validatingResult.user,
      [
        MeExtendedOption.CATEGORIES,
        MeExtendedOption.CATEGORIES_LIMIT,
        MeExtendedOption.NOTES,
        MeExtendedOption.TODAYS_TIMELOGS,
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
  @Get('me-with-current-token')
  async handleRequestGetMeWithCurrentToken(
    @UserDecorator() user: User,
    @CurrentTokenDecorator() currentToken: Token
  ) {
    return { user, currentToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me-extended')
  async handleRequestMeExtended(
    @UserDecorator() user: User,
    @Body() meExtendedDto: MeExtendedDto
  ) {
    const { extend } = meExtendedDto;
    return await this.userService.getMeExtended(user, extend);
  }

  @UseGuards(JwtAuthGuard, CheckUserControlValueGuard)
  @Post('set-name')
  async handleRequestSetName(
    @UserDecorator() user: User,
    @Body() setNameDto: SetNameDto
  ) {
    const { name } = setNameDto;
    const updateNameStatus = await this.userService.setName(user, name);
    if (!updateNameStatus.success) {
      throw new BadRequestException({
        error: updateNameStatus.error,
      });
    }
    return updateNameStatus;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async handleRequestChangePassword(
    @UserDecorator() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    const { currentPassword, newPassword } = changePasswordDto;
    const changePasswordStatus = await this.userService.changePassword(
      user,
      currentPassword,
      newPassword
    );
    if (!changePasswordStatus.success) {
      throw new BadRequestException({
        error: changePasswordStatus.error,
      });
    }
    return changePasswordStatus;
  }

  @UseGuards(JwtAuthGuard)
  @Post('initialize-email-change')
  async handleRequestInitializeEmailChange(
    @UserDecorator() user: User,
    @Body() initializeEmailChangeDto: InitializeEmailChangeDto
  ) {
    const { currentEmail } = initializeEmailChangeDto;
    const changePasswordStatus = await this.userService.initializeEmailChange(
      user,
      currentEmail
    );
    if (!changePasswordStatus.success) {
      throw new BadRequestException({
        error: changePasswordStatus.error,
      });
    }
    return changePasswordStatus;
  }

  @UseGuards(JwtAuthGuard, CheckUserControlValueGuard)
  @Post('change-timezone')
  async handleRequestChangeTimezone(
    @UserDecorator() user: User,
    @Body() changeTimezoneDto: ChangeTimezoneDto
  ) {
    const { timezone } = changeTimezoneDto;
    const changePasswordStatus = await this.userService.changeTimezone(
      user,
      timezone
    );
    if (!changePasswordStatus.success) {
      throw new BadRequestException({
        error: changePasswordStatus.error,
      });
    }
    return changePasswordStatus;
  }

  @UseGuards(JwtAuthGuard, CheckUserControlValueGuard)
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

  @UseGuards(JwtAuthGuard, CheckUserControlValueGuard)
  @Post('set-sorting-notes')
  async handleRequestSetSortingNotes(
    @UserDecorator() user: User,
    @Body() setSortingNotesDto: SetSortingNotesDto
  ) {
    const { sortingNotes } = setSortingNotesDto;
    const updateSortingCategoriesStatus =
      await this.userService.setSortingNotes(user, sortingNotes);
    if (!updateSortingCategoriesStatus.success) {
      throw new BadRequestException({
        error: updateSortingCategoriesStatus.error,
      });
    }
    return updateSortingCategoriesStatus;
  }
}
