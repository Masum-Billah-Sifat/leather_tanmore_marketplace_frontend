// components/AuthBootstrap.tsx
"use client";

import { useEffect } from "react";
import axios from "@/utils/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { buildClientHeaders } from "@/utils/authHeader";

export default function AuthBootstrap() {
  const {
    hydrated,
    access_token,
    refresh_token,
    user,
    isLoggingOut,
    setSession,
    clearSession,
  } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    if (isLoggingOut) return;

    // If no refresh token, nothing to do.
    if (!refresh_token) return;

    // Your current policy: refresh on load only when access token is missing.
    // Keep this if you don’t want an extra request on every reload.
    if (access_token) return;

    const run = async () => {
      try {
        const res = await axios.post(
          "/api/auth/refresh",
          { refresh_token },
          {
            headers: buildClientHeaders(),
            _skipAuthHeader: true, // ✅ never attach Authorization for refresh
          }
        );

        const { access_token: newAccess, refresh_token: newRefresh, user: userPatch } =
          res.data.data;

        const mergedUser = userPatch
          ? user
            ? { ...user, ...userPatch }
            : userPatch
          : user;

        // re-check logout race after await
        if (useAuthStore.getState().isLoggingOut) return;

        setSession(newAccess, newRefresh, mergedUser);

        // ✅ hydrate cart once after session is restored
        await useCartStore.getState().fetchCart();
      } catch {
        clearSession();
        useCartStore.getState().clearLocal();
      }
    };

    run();
  }, [hydrated, access_token, refresh_token, user, isLoggingOut, setSession, clearSession]);

  return null;
}

