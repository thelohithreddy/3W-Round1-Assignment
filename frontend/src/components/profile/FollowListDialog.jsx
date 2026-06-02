import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as userApi from '../../api/userApi';
import { formatDisplayName, formatHandle, getColorFromUsername } from '../../utils/userDisplay';
import { getInitials } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';

const FollowListDialog = ({ open, type, userId, onClose }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const title = type === 'followers' ? 'Followers' : 'Following';

  useEffect(() => {
    if (!open || !type) return;

    const load = async () => {
      setLoading(true);
      try {
        let data;
        if (userId) {
          const apiCall =
            type === 'followers' ? userApi.getUserFollowers : userApi.getUserFollowing;
          ({ data } = await apiCall(userId));
        } else {
          const apiCall = type === 'followers' ? userApi.getFollowers : userApi.getFollowing;
          ({ data } = await apiCall());
        }
        setUsers(data.data.users);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, type, userId]);

  const openUser = (id) => {
    onClose();
    const uid = id?.toString?.() || id;
    if (uid === currentUser?._id?.toString()) {
      navigate('/profile');
    } else {
      navigate(`/user/${uid}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 200 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : users.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          </Typography>
        ) : (
          <List disablePadding>
            {users.map((u) => (
              <ListItem key={u._id} disablePadding>
                <ListItemButton onClick={() => openUser(u._id)}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getColorFromUsername(u.username) }}>
                      {getInitials(u.username)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={formatDisplayName(u.username)}
                    secondary={formatHandle(u.username)}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
