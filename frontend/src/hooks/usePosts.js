import { useCallback, useState } from 'react';
import * as postApi from '../api/postApi';

const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const { data } = await postApi.getPosts(pageNum, 10);
      const { posts: newPosts, pagination } = data.data;

      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setPage(pagination.page);
      setHasMore(pagination.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchPosts(page + 1, true);
  }, [fetchPosts, hasMore, loadingMore, page]);

  const prependPost = useCallback((post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePost = useCallback((postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const updatePostsByAuthor = useCallback((authorId, updates) => {
    const authorKey = authorId?.toString?.() || authorId;
    setPosts((prev) =>
      prev.map((p) => {
        const id = p.author?.toString?.() || p.author;
        return id === authorKey ? { ...p, ...updates } : p;
      })
    );
  }, []);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchPosts,
    loadMore,
    prependPost,
    updatePost,
    removePost,
    updatePostsByAuthor,
    setError,
  };
};

export default usePosts;
