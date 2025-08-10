export interface JwtPayload {
  id_user: string;
  type: string; // 'owner' | 'client' etc.
  iat?: number;
  exp?: number;
}