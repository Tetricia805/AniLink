export type UserRole = 'OWNER' | 'VET' | 'SELLER' | 'ADMIN';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  profileImageUrl?: string | null;
  district?: string | null;
  createdAt?: string | null;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
}

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  phone: string | null;
  role: UserRole;
}
