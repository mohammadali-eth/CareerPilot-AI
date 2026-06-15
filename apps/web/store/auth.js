import { create } from "zustand";
export const useAuthStore = create((set) => ({
    accessToken: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
    refreshToken: typeof window !== "undefined"
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
    updateUser: (updatedFields) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedFields } : null,
    })),
    setInitialized: (isInitialized) => set({ isInitialized }),
}));
