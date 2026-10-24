import { IsInt, Max, Min } from 'class-validator';

export class StudyTimeDto {
  /** Active seconds counted by the browser since its last report (the server caps the credit). */
  @IsInt()
  @Min(1)
  @Max(300)
  seconds: number;
}
