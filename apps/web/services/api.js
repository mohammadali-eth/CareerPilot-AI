import { useAuthStore } from "../store/auth";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
class ApiClient {
    isRefreshing = false;
    refreshSubscribers = [];
    subscribeTokenRefresh(cb) {
        this.refreshSubscribers.push(cb);
    }
    onRefreshed(token) {
        this.refreshSubscribers.forEach((cb) => cb(token));
        this.refreshSubscribers = [];
    }
    async request(endpoint, options = {}) {
        const { skipAuth = false, ...fetchOptions } = options;
        const url = `${API_URL}${endpoint}`;
        // Setup headers
        const headers = new Headers(fetchOptions.headers || {});
        if (!headers.has("Content-Type") &&
            !(fetchOptions.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }
        // Attach access token
        const token = typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;
        if (token && !skipAuth) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        fetchOptions.headers = headers;
        try {
            const response = await fetch(url, fetchOptions);
            // Handle token expiration (401 Unauthorized)
            if (response.status === 401 && !skipAuth) {
                return this.handleUnauthorized(endpoint, fetchOptions);
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "An error occurred while processing the request.");
            }
            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }
            return await response.json();
        }
        catch (error) {
            throw error;
        }
    }
    async handleUnauthorized(endpoint, options) {
        const refreshToken = typeof window !== "undefined"
            ? localStorage.getItem("refresh_token")
            : null;
        const clearAuth = useAuthStore.getState().clearAuth;
        if (!refreshToken) {
            clearAuth();
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
            throw new Error("Session expired.");
        }
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
                const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
                if (!refreshResponse.ok) {
                    throw new Error("Failed to refresh token.");
                }
                const data = await refreshResponse.json();
                const setAuth = useAuthStore.getState().setAuth;
                // Fetch new profile state
                const userProfile = await fetch(`${API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${data.access_token}`,
                    },
                }).then((res) => res.json());
                setAuth(data.access_token, data.refresh_token, userProfile);
                this.isRefreshing = false;
                this.onRefreshed(data.access_token);
            }
            catch (err) {
                this.isRefreshing = false;
                clearAuth();
                if (typeof window !== "undefined") {
                    window.location.href = "/login?expired=true";
                }
                throw new Error("Session expired.");
            }
        }
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh((newAccessToken) => {
                const headers = new Headers(options.headers || {});
                headers.set("Authorization", `Bearer ${newAccessToken}`);
                options.headers = headers;
                fetch(`${API_URL}${endpoint}`, options)
                    .then(async (res) => {
                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        reject(new Error(errData.detail || "Request retry failed."));
                    }
                    else {
                        resolve(await res.json());
                    }
                })
                    .catch((err) => reject(err));
            });
        });
    }
    get(endpoint, options) {
        return this.request(endpoint, { ...options, method: "GET" });
    }
    post(endpoint, body, options) {
        const isFormData = typeof window !== "undefined" && body instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: "POST",
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        });
    }
    put(endpoint, body, options) {
        const isFormData = typeof window !== "undefined" && body instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: "PUT",
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        });
    }
    delete(endpoint, options) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
}
export const api = new ApiClient();
