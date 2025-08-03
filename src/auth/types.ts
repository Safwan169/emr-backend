// src/auth/types.ts
export interface RequestWithUser extends Request {
  user: {
    id: number;
    email?: string;
    role?: string;
    // add any other JWT payload fields you expect
  };
}
