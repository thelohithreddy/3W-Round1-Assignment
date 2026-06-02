import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppLayout from '../components/layout/AppLayout';
import PostCard from '../components/posts/PostCard';
import EmptyState from '../components/common/EmptyState';
import FollowListDialog from '../components/profile/FollowListDialog';
import useAuth from '../hooks/useAuth';
import { formatDisplayName, formatHandle } from '../utils/userDisplay';
import { getInitials } from '../utils/validators';
import * as userApi from '../api/userApi';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [followDialog, setFollowDialog] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isSelf = profile?.isSelf || currentUser?._id?.toString() === userId;

  useEffect(() => {
    if (isSelf && profile) {
      navigate('/profile', { replace: true });
    }
  }, [isSelf, profile, navigate]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userApi.getUserProfile(userId);
      if (data.data.user.isSelf) {
        navigate('/profile', { replace: true });
        return;
      }
      setProfile(data.data.user);
    } catch (err) {
      setError(err.message || 'User not found');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const { data } = await userApi.getUserPosts(userId, 1, 20);
      setPosts(data.data.posts);
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [loadProfile, loadPosts]);

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    const prev = profile.followedByMe;
    setProfile((p) => ({
      ...p,
      followedByMe: !prev,
      followersCount: prev ? p.followersCount - 1 : p.followersCount + 1,
    }));
    try {
      const { data } = await userApi.toggleFollow(userId);
      setProfile((p) => ({
        ...p,
        followedByMe: data.data.following,
        followersCount: data.data.followersCount,
      }));
      refreshUser();
    } catch (err) {
      setProfile((p) => ({
        ...p,
        followedByMe: prev,
        followersCount: prev ? p.followersCount + 1 : p.followersCount - 1,
      }));
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setFollowLoading(false);
    }
  };

  const showError = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' });
  const showSuccess = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' });

  if (loading) {
    return (
      <AppLayout title="Profile" showHeaderStats={false}>
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout title="Profile" showHeaderStats={false}>
        <Box p={2}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Back
          </Button>
          <Alert severity="error">{error || 'User not found'}</Alert>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile" showHeaderStats={false}>
      <Box sx={{ pb: 2 }}>
        <Box px={2} pt={1}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" sx={{ mb: 1 }}>
            Back
          </Button>
        </Box>

        <Box className="profile-cover" />

        <Box sx={{ px: 2 }} className="profile-avatar-wrap">
          <Box display="flex" justifyContent="space-between" alignItems="flex-end">
            <Avatar
              sx={{
                width: 88,
                height: 88,
                bgcolor: profile.avatarColor || 'primary.main',
                fontSize: 32,
                border: 4,
                borderColor: 'background.paper',
              }}
            >
              {getInitials(profile.username)}
            </Avatar>
            <Button
              variant={profile.followedByMe ? 'outlined' : 'contained'}
              onClick={handleFollow}
              disabled={followLoading}
              sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 700, mb: 1 }}
            >
              {followLoading ? '...' : profile.followedByMe ? 'Following' : 'Follow'}
            </Button>
          </Box>

          <Typography variant="h5" fontWeight={800} mt={1.5}>
            {formatDisplayName(profile.username)}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            {formatHandle(profile.username)}
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            gap={1}
            mt={2}
            p={1.5}
            sx={{ bgcolor: 'action.hover', borderRadius: 2 }}
          >
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={800}>
                {profile.postsCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Posts
              </Typography>
            </Box>
            <Box
              textAlign="center"
              onClick={() => setFollowDialog('followers')}
              sx={{ cursor: 'pointer', py: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.selected' } }}
            >
              <Typography variant="h6" fontWeight={800}>
                {profile.followersCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Followers
              </Typography>
            </Box>
            <Box
              textAlign="center"
              onClick={() => setFollowDialog('following')}
              sx={{ cursor: 'pointer', py: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.selected' } }}
            >
              <Typography variant="h6" fontWeight={800}>
                {profile.followingCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Following
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, mt: 2, mb: 1 }}>
          Posts
        </Typography>

        <Box className="feed-scroll" sx={{ pt: 0 }}>
          {postsLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ mb: 1.5 }} />
          ) : posts.length === 0 ? (
            <EmptyState title="No posts yet" message="This user hasn't shared anything." />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLikeUpdate={(id, data) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p._id === id ? { ...p, likedByMe: data.likedByMe, likesCount: data.likesCount } : p
                    )
                  )
                }
                onCommentUpdate={(id, data) =>
                  setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, ...data } : p)))
                }
                onPostUpdate={(id, updated) =>
                  setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, ...updated } : p)))
                }
                onError={showError}
                onSuccess={showSuccess}
                onFollowUpdate={() => {
                  refreshUser();
                  loadProfile();
                }}
              />
            ))
          )}
        </Box>
      </Box>

      <FollowListDialog
        open={Boolean(followDialog)}
        type={followDialog}
        userId={userId}
        onClose={() => setFollowDialog(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 10 }}
      >
        <Alert severity={snackbar.severity} onClick={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default UserProfile;
