import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import * as userApi from '../../api/userApi';
import { getInitials } from '../../utils/validators';

const FollowSuggestions = ({ onFollowChange }) => {
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await userApi.getFollowSuggestions();
        setUsers(data.data.users);
      } catch {
        setUsers([]);
      }
    };
    load();
  }, []);

  const handleFollow = async (userId) => {
    setLoadingId(userId);
    try {
      const { data } = await userApi.toggleFollow(userId);
      if (data.data.following) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
      onFollowChange?.(userId, data.data);
    } catch {
      /* ignore */
    } finally {
      setLoadingId(null);
    }
  };

  if (users.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, px: 0.5 }}>
        Who to follow
      </Typography>
      <Box className="who-to-follow-scroll" sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 0.5 }}>
        {users.map((u) => (
          <Card key={u._id} className="suggestion-card">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center', width: 140 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  mx: 'auto',
                  mb: 1,
                  bgcolor: u.avatarColor || 'primary.main',
                }}
              >
                {getInitials(u.username)}
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {u.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                @{u.username}
              </Typography>
              <Button
                size="small"
                variant="contained"
                fullWidth
                disabled={loadingId === u._id}
                onClick={() => handleFollow(u._id)}
                sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 700 }}
              >
                {loadingId === u._id ? '...' : 'Follow'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default FollowSuggestions;
