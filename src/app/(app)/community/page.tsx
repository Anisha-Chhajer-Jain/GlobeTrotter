"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Users2 } from "lucide-react";
import toast from "react-hot-toast";
import { communityApi, tripsApi, ApiError } from "@/lib/api-client";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CommunityPostCard from "@/components/community/CommunityPostCard";

const PAGE_SIZE = 12;
const emptyForm = { title: "", content: "", imageUrl: "", tripId: "" };

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function load(pageToLoad = 1, append = false) {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await communityApi.list({ query: query || undefined, sortBy, page: pageToLoad, limit: PAGE_SIZE });
      setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
      setPage(pageToLoad);
      setHasMore(pageToLoad < res.pagination.pages);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(1, false), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortBy]);

  function openCreate() {
    setForm(emptyForm);
    setCreateOpen(true);
    if (myTrips.length === 0) {
      tripsApi.list({ limit: 50 }).then((res) => setMyTrips(res.trips));
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await communityApi.create({
        title: form.title,
        content: form.content,
        imageUrl: form.imageUrl || undefined,
        tripId: form.tripId || undefined,
      });
      toast.success("Shared with the community!");
      setCreateOpen(false);
      load(1, false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to share post");
    } finally {
      setSaving(false);
    }
  }

  function handleDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-blue-600" /> Community
          </h1>
          <p className="text-gray-500 text-sm mt-1">Share your trip experiences, and discover what other travelers loved.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Share Experience
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search posts..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "popular")} className="sm:w-48">
          <option value="recent">Most recent</option>
          <option value="popular">Most liked</option>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading community posts..." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No posts yet"
          description="Be the first to share a trip experience."
          action={
            <Button className="mt-2" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Share Experience
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} onDeleted={handleDeleted} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" loading={loadingMore} onClick={() => load(page + 1, true)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Share Your Experience" size="md">
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Textarea
            label="Your experience"
            rows={4}
            required
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="What made this trip or activity memorable?"
          />
          <Input
            label="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
          <Select label="Link to a trip (optional)" value={form.tripId} onChange={(e) => setForm((f) => ({ ...f, tripId: e.target.value }))}>
            <option value="">None</option>
            {myTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving} disabled={!form.title || !form.content}>
              Post
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
