// utils/axios.ts
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { buildClientHeaders } from "@/utils/authHeader";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Your backend returns:
 *  {
 *    status: "error",
 *    message: "unauthorized" | "forbidden" | "bad request" | ...
 *    error:   "auth error: invalid or expired access token" | ...
 *  }
 *
 * The decision signal should be `error`, not `message`.
 */
function extractBackendError(err: any): { raw?: string; reason?: string } {
  const data = err?.response?.data;
  const raw = (data?.error || data?.message) as string | undefined;
  if (!raw) return { raw: undefined, reason: undefined };

  const lowered = raw.toLowerCase().trim();

  // normalize prefixes so comparisons are stable
  // "auth error: X" -> "x"
  // "validation error: ..." -> "validation error: ..." (we won't treat as auth)
  let reason = lowered;

  if (reason.startsWith("auth error:")) {
    reason = reason.replace(/^auth error:\s*/, "");
  }

  return { raw, reason };
}

// -------------------- single-flight refresh --------------------
let refreshPromise:
  | Promise<{ access: string; refresh: string; userPatch?: any }>
  | null = null;

async function refreshTokens(): Promise<{
  access: string;
  refresh: string;
  userPatch?: any;
}> {
  const { refresh_token, isLoggingOut } = useAuthStore.getState();

  if (isLoggingOut) throw new Error("Logging out");
  if (!refresh_token) throw new Error("No refresh token");

  if (!refreshPromise) {
    refreshPromise = (async () => {
      // refresh endpoint requires fingerprint headers (and maybe platform)
      const res = await instance.post(
        "/api/auth/refresh",
        { refresh_token },
        { headers: { ...buildClientHeaders() }, _skipAuthHeader: true as any }
      );

      const data = res.data.data;
      return {
        access: data.access_token,
        refresh: data.refresh_token,
        userPatch: data.user, // may be partial
      };
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

// -------------------- request interceptor --------------------
instance.interceptors.request.use(
  (config: any) => {
    const { access_token } = useAuthStore.getState();

    // Always attach fingerprint headers (backend expects these to match session)
    config.headers = {
      ...(config.headers || {}),
      ...buildClientHeaders(),
    };

    // For refresh calls (and any future special calls), allow skipping Authorization
    if (!config._skipAuthHeader && access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- response interceptor --------------------
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config || {};
    const { reason } = extractBackendError(error);

    const { isLoggingOut, clearSession, setSession, user } =
      useAuthStore.getState();

    // If user clicked logout, never refresh and never repopulate session.
    if (isLoggingOut) return Promise.reject(error);

    // Never refresh for logout endpoint itself (even if token expired)
    if (originalRequest?.url?.includes("/api/auth/logout")) {
      return Promise.reject(error);
    }

    // Prevent refresh loops
    if (originalRequest?.url?.includes("/api/auth/refresh")) {
      clearSession();
      return Promise.reject(error);
    }

    // Force-logout reasons (normalized; prefix removed)
    const FORCE_LOGOUT_REASONS = [
      "missing access token",
      "invalid user id format",
      "user not found",
      "user is archived",
      "user is banned",
    ];

    if (reason && FORCE_LOGOUT_REASONS.includes(reason)) {
      clearSession();
      return Promise.reject(error);
    }

    const isAccessExpired = reason === "invalid or expired access token";

    // Access expired => refresh once and retry original request
    if (isAccessExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { access, refresh, userPatch } = await refreshTokens();

        // After await, re-check logout flag to avoid race
        if (useAuthStore.getState().isLoggingOut) {
          return Promise.reject(error);
        }

        const mergedUser = userPatch
          ? user
            ? { ...user, ...userPatch }
            : userPatch
          : user;

        setSession(access, refresh, mergedUser);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return instance(originalRequest);
      } catch (refreshErr) {
        clearSession();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;


// // utils/axios.ts
// import axios from "axios";
// import { useAuthStore } from "@/stores/useAuthStore";
// import { buildClientHeaders } from "@/utils/authHeader";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// const instance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
// });

// function getBackendMessage(err: any): string | undefined {
//   const data = err?.response?.data;
//   if (!data) return undefined;
//   // your backend uses: { message: "unauthorized", error: "auth error: ..." }
//   return (data.error || data.message) as string | undefined;
// }

// // single-flight refresh
// let refreshPromise:
//   | Promise<{ access: string; refresh: string; userPatch?: any }>
//   | null = null;

// async function refreshTokens(): Promise<{
//   access: string;
//   refresh: string;
//   userPatch?: any;
// }> {
//   const { refresh_token, isLoggingOut } = useAuthStore.getState();
//   if (isLoggingOut) throw new Error("Logging out");
//   if (!refresh_token) throw new Error("No refresh token");

//   if (!refreshPromise) {
//     refreshPromise = (async () => {
//       // IMPORTANT: refresh endpoint requires headers (fingerprint)
//       const res = await instance.post(
//         "/api/auth/refresh",
//         { refresh_token },
//         { headers: { ...buildClientHeaders() } }
//       );

//       const data = res.data.data;
//       return {
//         access: data.access_token,
//         refresh: data.refresh_token,
//         userPatch: data.user,
//       };
//     })().finally(() => {
//       refreshPromise = null;
//     });
//   }

//   return refreshPromise;
// }

// instance.interceptors.request.use(
//   (config) => {
//     const { access_token } = useAuthStore.getState();

//     // Always attach fingerprint headers so refresh/session policies stay consistent
//     config.headers = {
//       ...(config.headers || {}),
//       ...buildClientHeaders(),
//     };

//     if (access_token) {
//       (config.headers as any).Authorization = `Bearer ${access_token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// instance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config || {};
//     const rawMsg = getBackendMessage(error);
//     const msg = rawMsg?.toLowerCase();

//     const { isLoggingOut, clearSession, setSession, user } =
//       useAuthStore.getState();

//     // If logging out, never refresh
//     if (isLoggingOut) return Promise.reject(error);

//     const FORCE_LOGOUT_ERRORS = [
//       "missing access token",
//       "invalid user id format",
//       "user not found",
//       "user is archived",
//       "user is banned",
//     ];

//     // Match either "auth error: ..." or plain
//     if (msg && FORCE_LOGOUT_ERRORS.some((x) => msg.includes(x))) {
//       clearSession();
//       return Promise.reject(error);
//     }

//     // prevent loops
//     if (originalRequest?.url?.includes("/api/auth/refresh")) {
//       clearSession();
//       return Promise.reject(error);
//     }

//     const isAccessExpired = msg?.includes("invalid or expired access token");

//     if (isAccessExpired && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const { access, refresh, userPatch } = await refreshTokens();

//         // check logout flag again after await
//         if (useAuthStore.getState().isLoggingOut) {
//           return Promise.reject(error);
//         }

//         const mergedUser = userPatch
//           ? user
//             ? { ...user, ...userPatch }
//             : userPatch
//           : user;

//         setSession(access, refresh, mergedUser);

//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${access}`;

//         return instance(originalRequest);
//       } catch (refreshErr) {
//         clearSession();
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default instance;
