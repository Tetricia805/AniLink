export type UserRole = 'OWNER' | 'VET' | 'SELLER' | 'ADMIN'

export interface UserDto {
  id: string
  /** Full name (display + initials). Backend may return as full_name; map to name in API layer. */
  name: string
  email: string
  role: UserRole
  phone?: string | null
  profileImageUrl?: string | null
  /** Optional: backend may return avatar_url; use profileImageUrl or this for avatar. */
  avatar_url?: string | null
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken?: string
  user: UserDto
}

export interface RegisterRequestDto {
  name: string
  email: string
  password: string
  phone: string | null
  role: UserRole
}