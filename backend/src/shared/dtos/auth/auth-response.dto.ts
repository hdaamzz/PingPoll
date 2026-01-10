import { UserDto } from './user.dto';

export class AuthResponseDto {
  user: UserDto;
  token: string;
  refreshToken: string;

  constructor(user: UserDto, token: string, refreshToken: string) {
    this.user = user;
    this.token = token;
    this.refreshToken = refreshToken;
  }

  toJSON() {
    return {
      user: this.user.toJSON ? this.user.toJSON() : this.user,
      token: this.token,
      refreshToken: this.refreshToken,
    };
  }
}
