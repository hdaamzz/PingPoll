import { injectable } from 'tsyringe';
import { User } from '../models/user.model';
import { BaseRepository } from './base/base.repository';
import { IUserRepository } from './interfaces/user-repository.interface';
import { IUser } from '../interfaces/user.interface';

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await this.findOne({ googleId } as any);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email } as any);
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<IUser | null> {
    return await this.update(userId, {
      isOnline,
      lastSeen: new Date(),
    } as Partial<IUser>);
  }
}
