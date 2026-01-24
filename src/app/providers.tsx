// Auth0 v4 providers

'use client';

import type { PropsWithChildren } from "react";
import { Auth0Provider, useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useRef } from "react";

// Component to sync user to MongoDB after login
function UserSync({ children }: PropsWithChildren) {
  const { user, isLoading } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once when user logs in
    if (user && !isLoading && !hasSynced.current) {
      hasSynced.current = true;
      fetch('/api/user/sync', { method: 'POST' })
        .then(res => res.json())
        .then(data => console.log('User synced:', data))
        .catch(err => console.error('Failed to sync user:', err));
    }
  }, [user, isLoading]);

  return <>{children}</>;
}

export default function Providers({ children }: PropsWithChildren) {
  return (
    <Auth0Provider>
      <UserSync>
        {children}
      </UserSync>
    </Auth0Provider>
  );
}