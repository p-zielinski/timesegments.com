import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { CreateNoteDto } from './dto/create.dto';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';
import { DeleteNoteDto } from './dto/delete.dto';
import { UpdateNoteDto } from './dto/update.dto';
import { UserService } from '../user/user.service';
import { ControlValueService } from '../control-value/control-value.service';
import { ControlValue } from '@test1/shared';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';

@UseGuards(JwtAuthGuard)
@Controller('note')
export class NoteController {
  constructor(
    private noteService: NoteService,
    private userService: UserService,
    private controlValueService: ControlValueService
  ) {}

  @Post('create')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestCreateNewNote(
    @UserDecorator() user: User,
    @Body() createNoteDto: CreateNoteDto
  ) {
    const { categoryId, text } = createNoteDto;
    const createNoteStatus = await this.noteService.createNote(
      text,
      user.id,
      categoryId
    );
    if (!createNoteStatus.success) {
      throw new BadRequestException({
        error: createNoteStatus.error,
      });
    }
    return {
      ...createNoteStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.NOTES]
      ),
    };
  }

  @Post('update')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestUpdateNote(
    @UserDecorator() user: User,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    const { noteId, text } = updateNoteDto;
    const updateNoteStatus = await this.noteService.updateNote(
      noteId,
      text,
      user
    );
    if (!updateNoteStatus.success) {
      throw new BadRequestException({
        error: updateNoteStatus.error,
      });
    }
    return {
      ...updateNoteStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.NOTES]
      ),
    };
  }

  @Post('delete')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestDeleteNote(
    @UserDecorator() user: User,
    @Body() deleteNoteDto: DeleteNoteDto
  ) {
    const { noteId } = deleteNoteDto;
    const deleteNoteStatus = await this.noteService.deleteNote(noteId, user);
    if (!deleteNoteStatus.success) {
      throw new BadRequestException({
        error: deleteNoteStatus.error,
      });
    }
    return {
      ...deleteNoteStatus,
      partialControlValues: await this.controlValueService.getNewControlValues(
        user.id,
        [ControlValue.NOTES]
      ),
    };
  }

  @Get('find-all')
  async handleRequestFindAllNotes(@UserDecorator() user: User) {
    return { notes: await this.noteService.getUsersAll(user.id) };
  }
}
