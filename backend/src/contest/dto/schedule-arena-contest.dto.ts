import { IsDateString, IsOptional } from 'class-validator';

/**
 * Live window of a contest (ISO 8601). When omitted, the standard weekly slot
 * is used (next Sunday 17:00-20:00 in ARENA_TIMEZONE); on publish an existing
 * future window is kept.
 */
export class ScheduleArenaContestDto {
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
