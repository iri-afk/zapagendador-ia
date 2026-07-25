import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const userQuery = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!options?.redirectOnUnauthenticated) return;
    if (userQuery.isLoading) return;
    if (userQuery.data) return;

    setLocation(options?.redirectPath ?? "/login");
  }, [options?.redirectOnUnauthenticated, options?.redirectPath, setLocation, userQuery.data, userQuery.isLoading]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      setLocation("/login");
    },
  });

  const state = useMemo(() => {
    return {
      user: userQuery.data ?? null,
      loading: userQuery.isLoading,
      error: userQuery.error ?? null,
      isAuthenticated: Boolean(userQuery.data),
    };
  }, [userQuery.data, userQuery.error, userQuery.isLoading]);

  return {
    ...state,
    refresh: useCallback(async () => {
      await userQuery.refetch();
    }, [userQuery.refetch]),
    logout: useCallback(async () => {
      await logoutMutation.mutateAsync();
    }, [logoutMutation]),
  };
}
