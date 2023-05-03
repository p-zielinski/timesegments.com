import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NoteService } from './note.service';
import { UserDecorator } from '../../common/param-decorators/user.decorator';
import { User } from '@prisma/client';
import { CreateNoteDto } from './dto/create.dto';
import { JwtAuthGuard } from '../../common/auth/jwtAuth.guard';

@UseGuards(JwtAuthGuard)
@Controller('note')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post('create')
  async handleRequestCreateNewNote(
    @UserDecorator() user: User,
    @Body() createNoteDto: CreateNoteDto
  ) {
    return { note: await this.noteService.create(createNoteDto.note, user) };
  }
}
