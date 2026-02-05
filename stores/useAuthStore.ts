// stores/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  is_seller_profile_approved: boolean;
  mode: "customer" | "seller";
}

interface AuthState {
  access_token: string | null;
  refresh_token: string | null;
  user: User | null;

  hydrated: boolean;
  setHydrated: (v: boolean) => void;

  // ✅ prevents “re-login” race during logout
  isLoggingOut: boolean;
  setIsLoggingOut: (v: boolean) => void;

  setSession: (access: string, refresh: string, user: User | null) => void;
  setAccessToken: (access: string | null) => void;
  setRefreshToken: (refresh: string | null) => void;
  mergeUser: (patch: Partial<User>) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access_token: null,
      refresh_token: null,
      user: null,

      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      isLoggingOut: false,
      setIsLoggingOut: (v) => set({ isLoggingOut: v }),

      setSession: (access, refresh, user) =>
        set({
          access_token: access,
          refresh_token: refresh,
          user: user ? { ...user, mode: (user as any).mode ?? "customer" } : null,
        }),

      setAccessToken: (access) => set({ access_token: access }),
      setRefreshToken: (refresh) => set({ refresh_token: refresh }),

      mergeUser: (patch) => {
        const u = get().user;
        if (!u) return;
        set({
          user: {
            ...u,
            ...patch,
            mode: (patch as any).mode ?? u.mode ?? "customer",
          },
        });
      },

      clearSession: () => set({ access_token: null, refresh_token: null, user: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
