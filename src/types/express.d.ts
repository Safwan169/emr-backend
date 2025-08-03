declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email?: string;
      role?: string;
      // add any other fields your JWT contains
    };
  }
}
