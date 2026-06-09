"use client";

import { useState, useEffect, useCallback } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  plan: string;
  onboardingDone: boolean;
}

interface UseUserResult {
  user: CurrentUser | null;
  isLoaded: boolean;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoaded };
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
