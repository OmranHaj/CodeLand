import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsIn(['CHILD', 'STUDENT', 'PARENT', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'], {
    message: 'Role must be STUDENT (or CHILD), PARENT, or SUPER_ADMIN (or ADMIN).',
  })
  role!: string;
}
