/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * @author Ciami
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Send, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api';
import type { Post, Comment } from '../types';
import ImgWithFallback from '../components/ImgWithFallback';

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const now = Date.now();
  const date = new Date(dateStr.replace(/-/g, '/')).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(months / 12)}年前`;
}

function parseImages(images: string): string[] {
  if (!images) return [];
  return images.split(',').map((s) => s.trim()).filter(Boolean);
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<number, boolean>>({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPosts();
      const data = res.rows || res.data || [];
      setPosts(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载帖子失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = async (postId: number) => {
    try {
      await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              liked: !p.liked,
              likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1,
            };
          }
          return p;
        }),
      );
    } catch {
      // silently fail
    }
  };

  const toggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    setExpandedPostId(postId);

    if (!commentsMap[postId]) {
      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await api.getComments(postId);
        const data = res.rows || res.data || [];
        setCommentsMap((prev) => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
      } catch {
        setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = (commentInputs[postId] || '').trim();
    if (!content) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));
    try {
      await api.addComment({ postId, content });
      const res = await api.getComments(postId);
      const data = res.rows || res.data || [];
      setCommentsMap((prev) => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) return { ...p, commentCount: p.commentCount + 1 };
          return p;
        }),
      );
    } catch {
      // silently fail
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setSubmittingPost(true);
    try {
      await api.createPost({ content: newPostContent, images: newPostImages });
      setShowCreateModal(false);
      setNewPostContent('');
      setNewPostImages('');
      fetchPosts();
    } catch {
      // silently fail
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pb-32"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-2xl font-black">社区</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
        >
          <Plus className="w-5 h-5 text-on-primary" />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-surface-container-high border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-20">
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-6 py-2 bg-primary text-on-primary rounded-full font-bold"
          >
            重试
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-20 text-secondary">
          <MessageCircle className="w-16 h-16 text-outline-variant mx-auto mb-4" />
          <p className="text-lg font-bold mb-2">暂无帖子</p>
          <p className="text-sm">暂无帖子，发布第一条吧</p>
        </div>
      )}

      {/* Post list */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20"
            >
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                <ImgWithFallback
                  src={
                    post.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.nickName)}&background=random&size=40`
                  }
                  alt={post.nickName}
                  className="w-10 h-10 rounded-full object-cover bg-surface-container flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{post.nickName}</p>
                  <p className="text-[10px] text-outline">{formatTime(post.createTime)}</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3 whitespace-pre-wrap break-words">
                {post.content}
              </p>

              {/* Images */}
              {post.images && parseImages(post.images).length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 -mx-1 px-1">
                  {parseImages(post.images).map((img, idx) => (
                    <ImgWithFallback
                      key={idx}
                      src={img}
                      alt={`图片 ${idx + 1}`}
                      className="w-28 h-28 rounded-xl object-cover flex-shrink-0 bg-surface-container"
                    />
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-4 pt-2 border-t border-outline-variant/10">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 text-secondary hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${post.liked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-xs font-bold">{post.likeCount}</span>
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">{post.commentCount}</span>
                  {expandedPostId === post.id ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Comments panel */}
              <AnimatePresence initial={false}>
                {expandedPostId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-outline-variant/10">
                      {commentsLoading[post.id] ? (
                        <div className="flex justify-center py-4">
                          <div className="w-6 h-6 border-2 border-surface-container-high border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {(commentsMap[post.id] || []).length === 0 && (
                            <p className="text-center text-secondary text-xs py-4">暂无评论</p>
                          )}
                          <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                            {(commentsMap[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-2">
                                <ImgWithFallback
                                  src={
                                    comment.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.nickName)}&background=random&size=28`
                                  }
                                  alt={comment.nickName}
                                  className="w-7 h-7 rounded-full object-cover bg-surface-container flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold">{comment.nickName}</span>
                                    <span className="text-[10px] text-outline">
                                      {formatTime(comment.createTime)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-on-surface-variant mt-0.5">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comment input */}
                          <div className="flex items-center gap-2 mt-3">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="写评论..."
                              className="flex-1 bg-surface-container-low border-none rounded-full py-2 px-4 text-xs focus:ring-2 focus:ring-primary"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddComment(post.id);
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={
                                submittingComment[post.id] ||
                                !(commentInputs[post.id] || '').trim()
                              }
                              className="p-2 bg-primary rounded-full text-on-primary disabled:opacity-40 transition-opacity"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black">发布帖子</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="分享你的想法..."
                rows={4}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary resize-none"
              />

              <div className="mt-3">
                <label className="text-xs text-secondary font-bold mb-1 block">
                  图片链接（多个用逗号分隔）
                </label>
                <input
                  type="text"
                  value={newPostImages}
                  onChange={(e) => setNewPostImages(e.target.value)}
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  className="w-full bg-surface-container-low border-none rounded-full py-2 px-4 text-xs focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleCreatePost}
                disabled={submittingPost || !newPostContent.trim()}
                className="mt-4 w-full py-3 bg-primary text-on-primary rounded-full font-bold text-sm disabled:opacity-40 transition-opacity"
              >
                {submittingPost ? '发布中...' : '发布'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
