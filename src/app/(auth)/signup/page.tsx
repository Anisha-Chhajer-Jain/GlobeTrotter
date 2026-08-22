"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { authApi, ApiError } from "@/lib/api-client";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  bio: "",
  image: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
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
      await authApi.signup({
        ...form,
        phone: form.phone || undefined,
        city: form.city || undefined,
        country: form.country || undefined,
        bio: form.bio || undefined,
        image: form.image || undefined,
      });
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
    <AuthSplitLayout title="Create your account" subtitle="Start planning your next adventure.">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errors.form}</div>}

          <div className="flex items-center gap-4">
            {form.image ? (
              <img src={form.image} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100 shrink-0" />
            )}
            <Input
              label="Profile photo URL (optional)"
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://..."
              className="flex-1"
              error={errors.image}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="Jane"
              error={errors.firstName}
            />
            <Input
              label="Last name"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Traveler"
              error={errors.lastName}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-[38px] w-4 h-4 text-gray-400" />
            <Input
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone number"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 555 123 4567"
              error={errors.phone}
            />
            <Input label="City" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="San Francisco" error={errors.city} />
          </div>

          <Input label="Country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="USA" error={errors.country} />

          <Textarea
            label="Additional information (optional)"
            rows={3}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Tell us a bit about your travel style..."
            error={errors.bio}
          />

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
          <Button type="submit" className="w-full" loading={loading} size="lg">
            Register
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
    </AuthSplitLayout>
  );
}
