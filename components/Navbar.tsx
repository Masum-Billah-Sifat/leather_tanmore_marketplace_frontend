"use client";

import { useState } from "react";
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
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-semibold text-gray-800"
        >
          TANMORE
        </button>

        <nav className="flex items-center gap-6 text-gray-600">
          {/* ✅ Always visible cart button */}
          <button
            onClick={handleCartClick}
            className="text-sm font-medium text-gray-800 hover:underline"
          >
            Cart
          </button>

          {!hydrated ? (
            <span className="text-sm text-gray-400">Loading...</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-500">{user.email}</span>
              <span className="text-sm text-gray-500 capitalize">
                {user.mode}
              </span>

              {user.is_seller_profile_approved ? (
                <button
                  onClick={handleSwitchMode}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Switch Mode
                </button>
              ) : (
                <button
                  onClick={openSellerModal}
                  className="text-sm text-green-600 hover:underline"
                >
                  Become a Seller
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={openSellerModal}
                className="text-sm text-green-600 hover:underline"
              >
                Become a Seller
              </button>

              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => alert("Login Error")}
              />
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
