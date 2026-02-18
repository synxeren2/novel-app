"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, User, Reply, X } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  rating: number;
  userName: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsProps {
  novelId: string;
  session: any;
}

export default function Comments({ novelId, session }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [novelId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/novels/${novelId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Yorumlar yüklenemedi");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!session) return alert("Lütfen giriş yapın");

    const currentContent = parentId ? replyContent : content;
    if (!currentContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/novels/${novelId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          rating: parentId ? 0 : rating, // Yanıtlarda puan önemli değil
          parentId,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyContent("");
          setReplyingTo(null);
        } else {
          setContent("");
          setRating(5);
        }
        fetchComments();
      }
    } catch (err) {
      alert("Yorum gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3 ${isReply ? "bg-white/5 border-l-4 border-l-white/20" : ""}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm">{comment.userName}</h4>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
              {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
        {!isReply && (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= comment.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
      
      {!isReply && session && (
        <button 
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Reply className="w-3 h-3" /> Yanıtla
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold border-l-4 border-white pl-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" /> Yorumlar ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {session ? (
        <form onSubmit={(e) => handleSubmit(e)} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Puanınız:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-colors ${star <= rating ? "text-yellow-500" : "text-gray-600"}`}
                >
                  <Star className={`w-6 h-6 ${star <= rating ? "fill-yellow-500" : ""}`} />
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bu roman hakkında ne düşünüyorsunuz?"
            className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-white transition-colors resize-none text-sm"
            rows={3}
          />
          
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-bold uppercase text-xs hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {loading ? "Gönderiliyor..." : "Yorumu Gönder"}
          </button>
        </form>
      ) : (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
          <p className="text-gray-400 text-sm">Yorum yapmak için lütfen <a href="/login" className="text-white underline">giriş yapın</a>.</p>
        </div>
      )}

      <div className="space-y-6">
        {fetching ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-white/5 rounded-2xl w-full" />
            <div className="h-20 bg-white/5 rounded-2xl w-full" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-10">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentItem comment={comment} />
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 space-y-2 border-l border-white/10 pl-4 mt-2">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} isReply />
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleSubmit(e, comment.id)} className="ml-8 mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-white outline-none"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={!replyContent.trim() || loading}
                    className="bg-white text-black p-2 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
