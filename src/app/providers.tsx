// Auth0 v4 providers

"use client";

import type { PropsWithChildren } from "react";
import { Auth0Provider, useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef } from "react";
import { ARExperienceProvider } from "@/context/ar-experience-context";

// Component to sync user to MongoDB after login
function UserSync({ children }: PropsWithChildren) {
  const { user, isLoading, error } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once when user logs in (not when there's an error or no user)
    if (user && !isLoading && !error && !hasSynced.current) {
      hasSynced.current = true;
      fetch("/api/user/sync", { method: "POST" })
        .then((res) => res.json())
        .catch(() => {
          // Silently fail - user sync is not critical
        });
    }
  }, [user, isLoading, error]);

  return <>{children}</>;
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <Auth0Provider>
      <UserSync>
        <ARExperienceProvider>{children}</ARExperienceProvider>
      </UserSync>
    </Auth0Provider>
  );
}
