/* * type for expanding express request type to add userId */

export declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: 'admin' | 'user';
    }
  }
}
