declare module 'bcryptjs' {
  export function genSaltSync(rounds?: number): string;
  export function hashSync(s: string, salt: string | number): string;
  export function compareSync(s: string, hash: string): boolean;
  const bcrypt: {
    genSaltSync: typeof genSaltSync;
    hashSync: typeof hashSync;
    compareSync: typeof compareSync;
  };
  export default bcrypt;
}
