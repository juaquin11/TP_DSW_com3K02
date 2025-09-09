export type RegisterDTO = {
  name: string;
  email: string;
  phone: string;
  password: string;
  type: 'client' | 'owner';
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthResponseDTO = {
  user: {
    id_user: string;
    type: 'client' | 'owner';
    name?: string | null;
    email: string;
  };
  token: string;
};

export interface JwtPayload {
  id_user: string;
  type: 'client' | 'owner';
  iat?: number;
  exp?: number;
}