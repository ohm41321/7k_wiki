import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session.user type to include the 'id' property.
   */
  interface Session {
    user?: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type.
   */
  interface JWT {
    id: string;
  }
}
