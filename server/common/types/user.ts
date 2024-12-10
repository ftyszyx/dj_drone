export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}
