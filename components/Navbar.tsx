// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { GoogleLogin } from "@react-oauth/google";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";
import { buildClientHeaders } from "@/utils/authHeader";
import BecomeSellerModal from "@/components/BecomeSellerModal";
import { useCartStore } from "@/stores/useCartStore";

export default function Navbar() {
  const router = useRouter();

  const {
    hydrated,
    user,
    setSession,
    setAccessToken,
    mergeUser,
    clearSession,
    setIsLoggingOut,
  } = useAuthStore();

  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const cart = useCartStore();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await axios.post(
        "/api/auth/google",
        { id_token: idToken },
        { headers: buildClientHeaders() },
      );

      const { access_token, refresh_token, user } = res.data.data;

      const normalizedUser = {
        ...user,
        mode: user?.mode ?? "customer",
      };

      setSession(access_token, refresh_token, normalizedUser);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleSwitchMode = async () => {
    if (!user) return;
    try {
      const to_mode = user.mode === "customer" ? "seller" : "customer";
      const res = await axios.post("/api/user/switch-mode", { to_mode });
      const { access_token, mode } = res.data.data;

      setAccessToken(access_token);
      mergeUser({ mode });

      if (mode === "seller") router.push("/seller/dashboard");
      else router.push("/");
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post(
        "/api/auth/logout",
        {},
        { headers: buildClientHeaders() },
      );
    } catch (error) {
      console.warn("Logout API failed:", error);
    } finally {
      clearSession();
      cart.clearLocal();

      setIsLoggingOut(false);
      router.push("/");
    }
  };

  const openSellerModal = () => setSellerModalOpen(true);

  const handleCartClick = () => {
    if (!user) {
      alert("Please login first to view your cart.");
      return;
    }
    router.push("/cart");
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 h-16 w-full border-b transition",
        scrolled
          ? "border-black/10 bg-[rgb(var(--surface))] shadow-sm"
          : "border-black/5 bg-[rgb(var(--surface))]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--surface))]/60",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex justify-between items-center">
        <button
          onClick={() => router.push("/")}
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[rgb(var(--text))]"
        >
          TANMORE
        </button>

        <nav className="flex items-center gap-3 text-[rgb(var(--muted))]">
          <button
            onClick={handleCartClick}
            className="
              rounded-full px-3 py-1.5 text-sm font-medium
              text-[rgb(var(--text))]
              hover:bg-black/5
            "
          >
            Cart
          </button>

          {!hydrated ? (
            <span className="text-sm text-[rgb(var(--muted))]">Loading...</span>
          ) : user ? (
            <>
              <span className="hidden md:inline text-sm text-[rgb(var(--muted))]">
                {user.email}
              </span>
              <span className="hidden sm:inline text-sm text-[rgb(var(--muted))] capitalize">
                {user.mode}
              </span>

              {user.is_seller_profile_approved ? (
                <button
                  onClick={handleSwitchMode}
                  className="
                    rounded-full px-3 py-1.5 text-sm font-medium
                    text-[rgb(var(--brand))]
                    hover:bg-[rgb(var(--brand))]/10
                  "
                >
                  Switch Mode
                </button>
              ) : (
                <button
                  onClick={openSellerModal}
                  className="
                    rounded-full px-3 py-1.5 text-sm font-medium
                    text-[rgb(var(--brand))]
                    hover:bg-[rgb(var(--brand))]/10
                  "
                >
                  Become a Seller
                </button>
              )}

              <button
                onClick={handleLogout}
                className="
                  rounded-full px-3 py-1.5 text-sm font-medium
                  text-red-600 hover:bg-red-600/10
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={openSellerModal}
                className="
                  rounded-full px-3 py-1.5 text-sm font-medium
                  text-[rgb(var(--brand))]
                  hover:bg-[rgb(var(--brand))]/10
                "
              >
                Become a Seller
              </button>

              <div className="rounded-xl overflow-hidden border border-black/10 bg-white">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => alert("Login Error")}
                />
              </div>
            </>
          )}
        </nav>
      </div>

      <BecomeSellerModal
        open={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
        isLoggedIn={!!user}
      />
    </header>
  );
}
