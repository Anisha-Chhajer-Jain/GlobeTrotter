"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { authApi, ApiError } from "@/lib/api-client";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ email, token, newPassword, confirmPassword });
      toast.success("Password reset. Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-sm text-gray-600">This reset link is invalid or incomplete.</p>
        <Link href="/forgot-password" className="text-sm text-blue-600 font-semibold hover:underline mt-3 inline-block">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      <p className="text-sm text-gray-500">
        Resetting password for <span className="font-semibold text-gray-700">{email}</span>
      </p>
      <div className="relative">
        <Lock className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
        <Input
          label="New password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="pl-9"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
        <Input
          label="Confirm new password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat password"
          className="pl-9"
        />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl mb-6">
            <Globe2 className="w-7 h-7" /> GlobeTrotter
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
