export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyId: string;
    roleId?: string;
    roleCode?: string;
  };
}
