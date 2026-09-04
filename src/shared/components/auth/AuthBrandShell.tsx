type AuthBrandShellProps = {
  children: React.ReactNode;
};

/** Centered auth stage — logo lives inside the sign-in / sign-up cards. */
export const AuthBrandShell = ({ children }: AuthBrandShellProps) => (
  <div className="flex min-h-svh flex-col bg-auth text-auth-foreground">
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[24rem]">{children}</div>
    </div>
  </div>
);
