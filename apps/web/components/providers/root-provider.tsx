"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth";
import { api } from "../../services/api";

// Create a singleton instance of QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function RootProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setAuth, clearAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    async function hydrateSession() {
      if (!accessToken) {
        setInitialized(true);
        return;
      }

      try {
        // Hydrate profile data from database using active token
        const userProfile = await api.get("/users/me");
        const refreshToken = localStorage.getItem("refresh_token") || "";
        setAuth(accessToken, refreshToken, userProfile);
      } catch (err) {
        // Clear broken tokens
        clearAuth();
      } finally {
        setInitialized(true);
      }
    }

    hydrateSession();
  }, [accessToken, setAuth, clearAuth, setInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
