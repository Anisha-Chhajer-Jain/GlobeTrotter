"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { User as UserIcon, Lock, Trash2 } from "lucide-react";
import { profileApi, ApiError } from "@/lib/api-client";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/Misc";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "INR", "CAD"];

export default function ProfilePage() {
  const { update: updateSession } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    profileApi
      .get()
      .then(({ user }) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  function update(field: string, value: string) {
    setUser((u: any) => ({ ...u, [field]: value }));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileErrors({});
    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({
        name: user.name,
        bio: user.bio || null,
        phone: user.phone || null,
        country: user.country || null,
        currency: user.currency,
        image: user.image || null,
      });
      setUser(updated);
      await updateSession({ name: updated.name, image: updated.image, currency: updated.currency });
      toast.success("Profile updated");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors.length) {
        const fe: Record<string, string> = {};
        err.fieldErrors.forEach((f) => (fe[f.field] = f.message));
        setProfileErrors(fe);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSaving(true);
    try {
      await profileApi.changePassword(pwForm);
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await profileApi.deleteAccount();
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading profile..." />;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-blue-600" /> Profile & Settings
      </h1>

      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Profile Information</h2>
        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <Input
              label="Profile photo URL"
              value={user.image || ""}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://..."
              error={profileErrors.image}
            />
          </div>
        </div>
        <Input label="Name" required value={user.name || ""} onChange={(e) => update("name", e.target.value)} error={profileErrors.name} />
        <Input label="Email" value={user.email} disabled />
        <Textarea label="Bio" rows={3} value={user.bio || ""} onChange={(e) => update("bio", e.target.value)} error={profileErrors.bio} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={user.phone || ""} onChange={(e) => update("phone", e.target.value)} error={profileErrors.phone} />
          <Input label="Country" value={user.country || ""} onChange={(e) => update("country", e.target.value)} error={profileErrors.country} />
        </div>
        <Select label="Preferred currency" value={user.currency} onChange={(e) => update("currency", e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h2>
        {pwError && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{pwError}</div>}
        <Input
          label="Current password"
          type="password"
          required
          value={pwForm.currentPassword}
          onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="New password"
            type="password"
            required
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <Input
            label="Confirm new password"
            type="password"
            required
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={pwSaving}>
            Update Password
          </Button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Delete Account</h2>
          <p className="text-sm text-gray-500 mt-0.5">Permanently remove your account and all your trips.</p>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete account"
        message="This permanently deletes your account and all trips you own. This cannot be undone."
        confirmLabel="Delete my account"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
