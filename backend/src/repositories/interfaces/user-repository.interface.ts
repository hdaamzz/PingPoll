import { IUser } from '../../models/user.model';
import { IBaseRepository } from '../../shared/interfaces/base-repository.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  updateOnlineStatus(userId: string, isOnline: boolean): Promise<IUser | null>;
}
