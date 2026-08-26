import type { ReactNode } from "react";
import {
  ClerkProvider,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
  SignInButton as ClerkSignInButton,
  SignOutButton as ClerkSignOutButton,
} from "@clerk/clerk-react";

export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

export const clerkEnabled = Boolean(CLERK_KEY);

/** Renders Clerk only when a publishable key is configured. */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return <ClerkProvider publishableKey={CLERK_KEY!}>{children}</ClerkProvider>;
}

export function useAuth() {
  if (!clerkEnabled) {
    return {
      isLoaded: true,
      isSignedIn: false,
      getToken: async () => null,
    } as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkAuth();
}

export function useUser() {
  if (!clerkEnabled) {
    return { isLoaded: true, isSignedIn: false, user: null } as const;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkUser();
}

export function SignInButton({
  children,
  mode,
}: {
  children?: ReactNode;
  mode?: "modal" | "redirect";
}) {
  if (!clerkEnabled) return <>{children}</>;
  return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
}

export function SignOutButton({ children }: { children?: ReactNode }) {
  if (!clerkEnabled) return <>{children}</>;
  return <ClerkSignOutButton>{children}</ClerkSignOutButton>;
}
