import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { NoteService } from './note.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { CreateNoteDto } from './dto/create.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { DeleteNoteDto } from './dto/delete.dto';
import { UpdateNoteDto } from './dto/update.dto';
import { ControlValue } from '@test1/shared';
import { ControlValuesGuard } from '../../common/guards/checkControlValues.guard';
import { ResponseService } from '../response/response.service';
import { ImportantControlValuesDecorator } from '../../common/param-decorators/importantControlValues';

@UseGuards(JwtAuthGuard)
@Controller('note')
export class NoteController {
  constructor(
    private noteService: NoteService,
    private responseService: ResponseService
  ) {}

  @Post('create')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestCreateNewNote(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() createNoteDto: CreateNoteDto
  ) {
    const { categoryId, text } = createNoteDto;
    const createNoteStatus = await this.noteService.createNote(
      text,
      user.id,
      categoryId
    );
    return await this.responseService.returnProperResponse(createNoteStatus, {
      userId: user.id,
      importantControlValues,
    });
  }

  @Post('update')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestUpdateNote(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    const { noteId, text } = updateNoteDto;
    const updateNoteStatus = await this.noteService.updateNote(
      noteId,
      text,
      user
    );
    return await this.responseService.returnProperResponse(updateNoteStatus, {
      userId: user.id,
      importantControlValues,
    });
  }

  @Post('delete')
  @SetMetadata('typesOfControlValuesToCheck', [ControlValue.NOTES])
  @UseGuards(ControlValuesGuard)
  async handleRequestDeleteNote(
    @UserDecorator() user: User,
    @ImportantControlValuesDecorator() importantControlValues: ControlValue[],
    @Body() deleteNoteDto: DeleteNoteDto
  ) {
    const { noteId } = deleteNoteDto;
    const deleteNoteStatus = await this.noteService.deleteNote(noteId, user);
    return await this.responseService.returnProperResponse(deleteNoteStatus, {
      userId: user.id,
      importantControlValues,
    });
  }
}
