"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Copy, Link2, Trash2, Mail } from "lucide-react";
import { sharesApi } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TripSharePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await sharesApi.list(tripId);
      setData(res);
    } catch {
      toast.error("Failed to load sharing settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleTogglePublic() {
    setToggling(true);
    try {
      const res = await sharesApi.togglePublic(tripId);
      setData((d: any) => ({ ...d, isPublic: res.isPublic, shareToken: res.shareToken, publicUrl: res.publicUrl }));
      toast.success(res.isPublic ? "Trip is now public" : "Trip is now private");
    } catch {
      toast.error("Failed to update sharing");
    } finally {
      setToggling(false);
    }
  }

  function copyLink() {
    if (!data?.publicUrl) return;
    const url = `${window.location.origin}${data.publicUrl}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await sharesApi.invite(tripId, { email, role, canEdit: role !== "VIEWER" });
      toast.success(res.message || "Invitation sent");
      setEmail("");
      load();
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      await sharesApi.remove(tripId, removeTarget.id);
      toast.success("Collaborator removed");
      load();
    } catch {
      toast.error("Failed to remove collaborator");
    } finally {
      setRemoveTarget(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading sharing settings..." />;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/trips/${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to itinerary
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Share Trip</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Public link</p>
            <p className="text-sm text-gray-500">Anyone with the link can view a read-only version of this trip.</p>
          </div>
          <Button variant={data.isPublic ? "secondary" : "outline"} size="sm" onClick={handleTogglePublic} loading={toggling}>
            {data.isPublic ? "Public" : "Private"}
          </Button>
        </div>
        {data.isPublic && data.publicUrl && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 truncate flex-1">{data.publicUrl}</span>
            <button onClick={copyLink} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="font-semibold text-gray-900">Invite collaborators</p>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              placeholder="friend@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-36">
            <option value="VIEWER">Viewer</option>
            <option value="EDITOR">Editor</option>
          </Select>
          <Button type="submit" loading={inviting}>
            Invite
          </Button>
        </form>

        {data.shares?.length > 0 && (
          <div className="divide-y divide-gray-50 pt-2">
            {data.shares.map((share: any) => (
              <div key={share.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{share.user?.name || share.email}</p>
                  <p className="text-xs text-gray-500">
                    {share.role} · {share.accepted ? "Accepted" : "Pending"}
                  </p>
                </div>
                <button onClick={() => setRemoveTarget(share)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove collaborator"
        message={`Remove ${removeTarget?.user?.name || removeTarget?.email} from this trip?`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
