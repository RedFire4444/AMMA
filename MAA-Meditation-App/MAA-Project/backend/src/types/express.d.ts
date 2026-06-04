/**
 * File: express.d.ts
 *
 * Description: TypeScript declaration file extending Express Request interface with custom user properties for authentication context.
 *
 * Author: Navnit(Ninjacode911)
 */

export {};

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      email?: string;
      phone?: string;
      [key: string]: any;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
