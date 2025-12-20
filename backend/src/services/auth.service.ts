import { injectable, inject } from 'tsyringe';
import { firebaseAuth } from '../config/firebase.config';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';
import { IAuthService } from './interfaces/auth-service.interface';
import { JwtUtil } from '../shared/utils/jwt.util';
import { AUTH_MESSAGES } from '../constants/messages.constants';
import { AuthResponseDto } from '../shared/dtos/auth/auth-response.dto';
import { UserDto } from '../shared/dtos/auth/user.dto';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository
  ) {}

  async verifyFirebaseToken(firebaseToken: string): Promise<AuthResponseDto> {
    try {
      const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
      const { uid, email, name, picture, email_verified } = decodedToken;

      if (!email) {
        throw new Error(AUTH_MESSAGES.EMAIL_NOT_FOUND);
      }

      let user = await this.userRepository.findByGoogleId(uid);

      if (!user) {
        user = await this.userRepository.create({
          googleId: uid,
          name: name || email.split('@')[0],
          email,
          picture: picture || '',
          emailVerified: email_verified || false,
        } as any);
      } else {
        user = await this.userRepository.update(user._id.toString(), {
          name: name || user.name,
          picture: picture || user.picture,
          emailVerified: email_verified || user.emailVerified,
          isOnline: true,
          lastSeen: new Date(),
        } as any) as any;
      }
      if(!user){
        throw new Error(`User not found in Auth service verifyFirebaseToken `);
      }

      const userDto = UserDto.fromModel(user);
      const jwtToken = JwtUtil.generateToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return new AuthResponseDto(userDto, jwtToken);
    } catch (error: any) {
      throw new Error(`${AUTH_MESSAGES.FIREBASE_TOKEN_INVALID}: ${error.message}`);
    }
  }

  async getUserById(userId: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(userId);
    return user ? UserDto.fromModel(user) : null;
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.userRepository.updateOnlineStatus(userId, isOnline);
  }
}
