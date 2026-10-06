import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { repository } from '@/data';
import type { User } from '@/data/types';

type Session = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    repository
      .currentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = useCallback(async () => {
    await repository.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, setUser, signOut }), [user, loading, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
