import { IsObject } from 'class-validator';

/** What the student played: seeds and code. Its shape per game is checked by the verifier. */
export class CompleteGameDto {
  @IsObject()
  proof!: Record<string, unknown>;
}
