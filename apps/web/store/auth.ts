import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  profile?: {
    first_name?: string;
    last_name?: string;
    target_role?: string;
    current_experience_level?: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: UserProfile,
  ) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken:
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  refreshToken:
    typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (accessToken, refreshToken, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      isInitialized: true,
    });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    })),

  setInitialized: (isInitialized) => set({ isInitialized }),
}));
