import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AppLayout from '../components/layout/AppLayout';
import FollowListDialog from '../components/profile/FollowListDialog';
import PostCard from '../components/posts/PostCard';
import EmptyState from '../components/common/EmptyState';
import useAuth from '../hooks/useAuth';
import { formatDisplayName, formatHandle } from '../utils/userDisplay';
import { getInitials } from '../utils/validators';
import * as postApi from '../api/postApi';

const TAB_FILTERS = ['my', 'liked', 'commented'];

const EMPTY_MESSAGES = {
  my: { title: 'No posts yet.', message: 'Posts you create will appear here.' },
  liked: { title: 'No liked posts.', message: 'Posts you like will show here.' },
  commented: { title: 'No comments yet.', message: 'Posts you comment on will show here.' },
};

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [followDialog, setFollowDialog] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ myPosts: 0, liked: 0, commented: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const currentFilter = TAB_FILTERS[tab];
  const empty = EMPTY_MESSAGES[currentFilter];

  const engagementStats = posts.reduce(
    (acc, p) => ({
      likes: acc.likes + (p.likesCount || 0),
      comments: acc.comments + (p.commentsCount || 0),
    }),
    { likes: 0, comments: 0 }
  );

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await postApi.getProfileCounts();
      setCounts(data.data);
    } catch {
      /* keep defaults */
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await postApi.getProfilePosts(currentFilter, 1, 20);
      setPosts(data.data.posts);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);

  useEffect(() => {
    fetchCounts();
    refreshUser();
  }, [fetchCounts, refreshUser]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const showError = (message) => setSnackbar({ open: true, message, severity: 'error' });
  const showSuccess = (message) => setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AppLayout title="Profile" showHeaderStats>
      <Box sx={{ pb: 2 }}>
        <Box className="profile-cover" />

        <Box sx={{ px: 2 }} className="profile-avatar-wrap">
          <Avatar
            sx={{
              width: 88,
              height: 88,
              bgcolor: user?.avatarColor || 'primary.main',
              fontSize: 32,
              border: 4,
              borderColor: 'background.paper',
            }}
          >
            {getInitials(user?.username)}
          </Avatar>

          <Box mt={1.5}>
            <Typography variant="h5" fontWeight={800}>
              {formatDisplayName(user?.username)}
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight={500}>
              {formatHandle(user?.username)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {user?.email}
            </Typography>
            {user?.createdAt && (
              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Joined{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={1}
            mt={2}
            p={1.5}
            sx={{ bgcolor: 'action.hover', borderRadius: 2 }}
          >
            <Box
              textAlign="center"
              onClick={() => setTab(0)}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' }, py: 0.5 }}
            >
              <Typography variant="h6" fontWeight={800}>
                {counts.myPosts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Posts
              </Typography>
            </Box>
            <Box
              textAlign="center"
              onClick={() => setFollowDialog('followers')}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' }, py: 0.5 }}
            >
              <Typography variant="h6" fontWeight={800}>
                {user?.followersCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Followers
              </Typography>
            </Box>
            <Box
              textAlign="center"
              onClick={() => setFollowDialog('following')}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' }, py: 0.5 }}
            >
              <Typography variant="h6" fontWeight={800}>
                {user?.followingCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Following
              </Typography>
            </Box>
          </Box>

          {currentFilter === 'my' && posts.length > 0 && (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                On your posts (this page)
              </Typography>
              <Box display="flex" gap={2}>
                <Typography variant="body2">
                  <strong>{engagementStats.likes}</strong> likes received
                </Typography>
                <Typography variant="body2">
                  <strong>{engagementStats.comments}</strong> comments received
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mt: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
          }}
        >
          <Tab label={`My Posts (${counts.myPosts})`} />
          <Tab label={`Liked (${counts.liked})`} />
          <Tab label={`Commented (${counts.commented})`} />
        </Tabs>

        <Box className="feed-scroll" sx={{ pt: 1 }}>
          {loading ? (
            <>
              <Skeleton variant="rounded" height={120} sx={{ mb: 1.5 }} />
              <Skeleton variant="rounded" height={120} sx={{ mb: 1.5 }} />
            </>
          ) : posts.length === 0 ? (
            <EmptyState
              title={empty.title}
              message={empty.message}
              icon={currentFilter === 'liked' ? FavoriteBorderIcon : undefined}
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeUpdate={(id, data) => {
                  setPosts((prev) =>
                    prev.map((p) =>
                      p._id === id ? { ...p, likedByMe: data.likedByMe, likesCount: data.likesCount } : p
                    )
                  );
                  if (currentFilter === 'liked' && !data.likedByMe) {
                    setPosts((prev) => prev.filter((p) => p._id !== id));
                  }
                  fetchCounts();
                }}
                onCommentUpdate={(id, data) => {
                  setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, ...data } : p)));
                  fetchCounts();
                }}
                onPostUpdate={(id, updated) => {
                  setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, ...updated } : p)));
                }}
                onDelete={
                  currentFilter === 'my'
                    ? (id) => {
                        setPosts((prev) => prev.filter((p) => p._id !== id));
                        setCounts((c) => ({ ...c, myPosts: Math.max(0, c.myPosts - 1) }));
                        showSuccess('Post deleted');
                      }
                    : undefined
                }
                onError={showError}
                onSuccess={showSuccess}
                onFollowUpdate={() => refreshUser()}
              />
            ))
          )}
        </Box>

        <Box px={2} pb={2}>
          <Divider sx={{ mb: 2 }} />
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ py: 1.25, borderRadius: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <FollowListDialog
        open={Boolean(followDialog)}
        type={followDialog}
        onClose={() => setFollowDialog(null)}
      />

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default Profile;
