'use client';

// This component is no longer needed for auth, but we keep it
// in case other providers are added in the future.

type Props = {
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children }: Props) => {
  return <>{children}</>;
};