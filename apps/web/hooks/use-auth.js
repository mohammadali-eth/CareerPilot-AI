import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";
// Login Hook
export function useLogin() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (credentials) => {
            // 1. Authenticate user
            const tokens = await api.post("/auth/login", credentials, {
                skipAuth: true,
            });
            // 2. Fetch authenticated profile data
            const userProfile = await api.get("/users/me", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });
            // 3. Update global store state
            setAuth(tokens.access_token, tokens.refresh_token, userProfile);
            return { tokens, userProfile };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
    });
}
// Registration Hook
export function useRegister() {
    return useMutation({
        mutationFn: async (data) => {
            return api.post("/auth/register", data, { skipAuth: true });
        },
    });
}
// Verification Hook
export function useVerifyEmail() {
    return useMutation({
        mutationFn: async (payload) => {
            return api.post("/auth/verify-email", payload, { skipAuth: true });
        },
    });
}
// Forgot Password Hook
export function useForgotPassword() {
    return useMutation({
        mutationFn: async (payload) => {
            return api.post("/auth/forgot-password", payload, { skipAuth: true });
        },
    });
}
// Reset Password Hook
export function useResetPassword() {
    return useMutation({
        mutationFn: async (payload) => {
            return api.post("/auth/reset-password", payload, { skipAuth: true });
        },
    });
}
// Fetch Profile Query Hook
export function useUserProfile() {
    const { accessToken, clearAuth } = useAuthStore();
    return useQuery({
        queryKey: ["user-profile", accessToken],
        queryFn: async () => {
            if (!accessToken)
                return null;
            try {
                return await api.get("/users/me");
            }
            catch (err) {
                clearAuth();
                throw err;
            }
        },
        enabled: !!accessToken,
        retry: false,
    });
}
// Update Profile Mutation Hook
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);
    return useMutation({
        mutationFn: async (profileData) => {
            const updatedUser = await api.put("/users/me", profileData);
            updateUser(updatedUser);
            return updatedUser;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        },
    });
}
// Logout Hook
export function useLogout() {
    const { refreshToken, clearAuth } = useAuthStore();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            if (refreshToken) {
                await api
                    .post("/auth/logout", { refresh_token: refreshToken })
                    .catch(() => { });
            }
            clearAuth();
        },
        onSuccess: () => {
            queryClient.clear();
        },
    });
}
