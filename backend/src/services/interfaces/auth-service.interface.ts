import { AuthResponseDto } from '../../shared/dtos/auth/auth-response.dto';
import { UserDto } from '../../shared/dtos/auth/user.dto';


export interface IAuthService {
  verifyFirebaseToken(firebaseToken: string): Promise<AuthResponseDto>;
  getUserById(userId: string): Promise<UserDto | null>;
  updateOnlineStatus(userId: string, isOnline: boolean): Promise<void>;
}
