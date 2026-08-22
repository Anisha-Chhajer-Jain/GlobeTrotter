"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Globe2, User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi, ApiError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authApi.signup(form);
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Account created — please log in.");
        router.push("/login");
        return;
      }
      toast.success("Welcome to GlobeTrotter!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.length) {
          const fe: Record<string, string> = {};
          err.fieldErrors.forEach((f) => (fe[f.field] = f.message));
          setErrors(fe);
        } else {
          setErrors({ form: err.message });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl mb-6">
            <Globe2 className="w-7 h-7" /> GlobeTrotter
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start planning your next adventure.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {errors.form && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errors.form}</div>}
          <div className="relative">
            <User className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
            <Input
              label="Full name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Jane Traveler"
              error={errors.name}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 8 characters"
              error={errors.password}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
            <Input
              label="Confirm password"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Repeat password"
              error={errors.confirmPassword}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
