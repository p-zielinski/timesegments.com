import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { LoginOrRegisterDto } from './dto/login.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { Token, User } from '@prisma/client';
import { MeExtendedDto } from './dto/meExtendedDto';
import { ControlValue } from '@test1/shared';
import { RegisterDto } from './dto/register.dto';
import { SetNameDto } from './dto/setName.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ChangeTimezoneDto } from './dto/changeTimezone.dto';
import { CurrentTokenDecorator } from '../../common/param-decorators/currentTokenDecorator';
import { SetSortingNotesDto } from './dto/setSortingNotes.dto';
import { SetSortingCategoriesDto } from './dto/setSortingCategories.dto';
import { ChangeEmailAddressDto } from './dto/changeEmailAddress.dto';
import { ControlValueService } from '../control-value/control-value.service';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';
import { InitializeEmailChangeDto } from './dto/initializeEmailChange.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private controlValueService: ControlValueService
  ) {}

  @Post('change-email-address')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return registeringResult;
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
    return validatingResult;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async handleRequestGetMe(@UserDecorator() user: User) {
    return { user };
  }

  @Post('me-extended')
  @UseGuards(JwtAuthGuard)
  async handleRequestMeExtended(
    @UserDecorator() user: User,
    @CurrentTokenDecorator() currentToken: Token,
    @Body() meExtendedDto: MeExtendedDto
  ) {
    const { extend } = meExtendedDto;
    return {
      ...(await this.userService.getMeExtended(user, extend, currentToken)),
      controlValues: await this.controlValueService.getAllUserControlValues(
        user.id
      ),
    };
  }

  @Post('set-name')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...updateNameStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.USER]
      ),
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
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

  @Post('initialize-email-change')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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

  @Post('change-timezone')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...changePasswordStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.USER]
      ),
    };
  }

  @Post('set-sorting-categories')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...updateSortingCategoriesStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.USER]
      ),
    };
  }

  @Post('set-sorting-notes')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.USER])
  @UseGuards(JwtAuthGuard, ControlValuesGuard)
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
    return {
      ...updateSortingCategoriesStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.USER]
      ),
    };
  }
}
