import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Skeleton,
  Snackbar,
  Stack,
} from '@mui/material';
import AppLayout from '../components/layout/AppLayout';
import CreatePostCard from '../components/posts/CreatePostCard';
import FeedFilterChips from '../components/posts/FeedFilterChips';
import PostCard from '../components/posts/PostCard';
import EmptyState from '../components/common/EmptyState';
import useAuth from '../hooks/useAuth';
import usePosts from '../hooks/usePosts';

const PostSkeleton = () => (
  <Box className="skeleton-post" sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 1.5 }}>
    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box flex={1}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="25%" height={14} sx={{ mt: 0.5 }} />
      </Box>
    </Stack>
    <Skeleton variant="text" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="rounded" height={180} sx={{ mt: 1.5 }} />
  </Box>
);

const Feed = () => {
  const { refreshUser } = useAuth();
  const {
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
  } = usePosts();

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterTab, setFilterTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const showError = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const showSuccess = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleRefresh = () => fetchPosts(1);

  const handleFollowUpdate = (authorId, data) => {
    updatePostsByAuthor(authorId, { followedByMe: data.following });
    refreshUser();
  };

  const matchPost = useCallback((p, q) => {
    const qq = q.trim().toLowerCase();
    if (!qq) return true;
    return (
      String(p?.text || '').toLowerCase().includes(qq) ||
      String(p?.authorUsername || '').toLowerCase().includes(qq)
    );
  }, []);

  const filteredPosts = useMemo(
    () => posts.filter((p) => matchPost(p, searchQuery)),
    [posts, matchPost, searchQuery]
  );

  // When searching, automatically load more pages until we find matches (or run out).
  const searchAutoLoadRef = useRef({ query: '', lastAttemptAt: 0 });
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;
    if (loading || loadingMore) return;
    if (!hasMore) return;
    if (filteredPosts.length > 0) return;

    const now = Date.now();
    const isSameQuery = searchAutoLoadRef.current.query === q;
    const tooSoon = now - searchAutoLoadRef.current.lastAttemptAt < 600;
    if (isSameQuery && tooSoon) return;

    searchAutoLoadRef.current = { query: q, lastAttemptAt: now };
    loadMore();
  }, [filteredPosts.length, hasMore, loadMore, loading, loadingMore, searchQuery]);

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (filterTab === 2) return (b.likesCount || 0) - (a.likesCount || 0);
    if (filterTab === 3) return (b.commentsCount || 0) - (a.commentsCount || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <AppLayout
      title="Social"
      showSearch
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <Box className="feed-scroll">
        <CreatePostCard onPostCreated={prependPost} onError={showError} />

        <FeedFilterChips active={filterTab} onChange={setFilterTab} />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading && posts.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : sortedPosts.length === 0 && !error ? (
          <EmptyState
            title={searchQuery ? 'No matching posts' : 'No posts yet'}
            message={
              searchQuery
                ? 'Try a different search term.'
                : 'Be the first to share something with the community!'
            }
          />
        ) : (
          <>
            {sortedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeUpdate={(id, data) =>
                  updatePost(id, {
                    likedByMe: data.likedByMe,
                    likesCount: data.likesCount,
                  })
                }
                onCommentUpdate={(id, data) => updatePost(id, data)}
                onPostUpdate={(id, updated) => updatePost(id, updated)}
                onDelete={removePost}
                onError={showError}
                onSuccess={showSuccess}
                onFollowUpdate={handleFollowUpdate}
              />
            ))}
            {hasMore && (
              <Box textAlign="center" py={2}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={loadingMore}
                  sx={{ borderRadius: 24, px: 4 }}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 10 }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default Feed;
