import { IUser } from "../../../interfaces/user.interface";
import { BaseDto } from "../base.dto";


export class UserDto extends BaseDto {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public emailVerified: boolean,
    public picture?: string,
    public isOnline?: boolean,
    public lastSeen?: Date
  ) {
    super();
  }

  static fromModel(user: IUser): UserDto {
    return new UserDto(
      user._id.toString(),
      user.name,
      user.email,
      user.emailVerified,
      user.picture,
      user.isOnline,
      user.lastSeen
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      picture: this.picture,
      emailVerified: this.emailVerified,
      isOnline: this.isOnline,
      lastSeen: this.lastSeen,
    };
  }
}
