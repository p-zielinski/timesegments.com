import { ScheduleToken } from '../../../common/validator-constraint/scheduleToken.rule';

export class DeleteUnclaimedAccountsDto {
  @ScheduleToken()
  token: string;
}
