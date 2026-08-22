"use client";

import { useState } from "react";
import { Heart, MessageCircle, MapPin, Trash2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { communityApi } from "@/lib/api-client";
import { Badge } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/format";

export default function CommunityPostCard({ post, onDeleted }: { post: any; onDeleted: (id: string) => void }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(!!post.likedByViewer);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[] | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const isOwner = session?.user?.id === post.userId || session?.user?.email === post.user?.email;

  async function toggleLike() {
    setLiked((v) => !v);
    setLikesCount((c: number) => (liked ? c - 1 : c + 1));
    try {
      await communityApi.toggleLike(post.id);
    } catch {
      setLiked((v) => !v);
      setLikesCount((c: number) => (liked ? c + 1 : c - 1));
      toast.error("Failed to update like");
    }
  }

  async function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments === null) {
      setLoadingComments(true);
      try {
        const res = await communityApi.get(post.id);
        setComments(res.post.comments);
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const { comment } = await communityApi.addComment(post.id, commentText.trim());
      setComments((prev) => [...(prev || []), comment]);
      setCommentText("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete() {
    try {
      await communityApi.remove(post.id);
      onDeleted(post.id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {post.imageUrl && <img src={post.imageUrl} alt="" className="w-full h-48 object-cover" />}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {post.user?.image ? (
            <img src={post.user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
              {post.user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{post.user?.name}</p>
            <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="font-bold text-gray-900 mt-3">{post.title}</h3>
        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{post.content}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          {post.trip && <Badge tone="blue">Trip: {post.trip.title}</Badge>}
          {post.city && (
            <Badge tone="indigo">
              <MapPin className="w-3 h-3 mr-1 inline" />
              {post.city.name}, {post.city.country}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
          <button onClick={toggleLike} className={`flex items-center gap-1.5 text-sm font-medium ${liked ? "text-red-600" : "text-gray-500"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-red-600" : ""}`} /> {likesCount}
          </button>
          <button onClick={toggleComments} className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <MessageCircle className="w-4 h-4" /> {post._count?.comments ?? comments?.length ?? 0}
          </button>
        </div>

        {commentsOpen && (
          <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
            {loadingComments ? (
              <p className="text-xs text-gray-400">Loading comments...</p>
            ) : (
              comments?.map((c) => (
                <div key={c.id} className="flex gap-2 text-sm">
                  <span className="font-semibold text-gray-900 shrink-0">{c.user?.name}:</span>
                  <span className="text-gray-600">{c.content}</span>
                </div>
              ))
            )}
            <div className="flex gap-2 pt-1">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button size="sm" onClick={handleAddComment} loading={posting} disabled={!commentText.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
