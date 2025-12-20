export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
