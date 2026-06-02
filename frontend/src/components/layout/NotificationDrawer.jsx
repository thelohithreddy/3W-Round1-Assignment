import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import * as userApi from '../../api/userApi';
import { formatRelativeTime } from '../../utils/formatDate';
import useAuth from '../../hooks/useAuth';

const typeIcon = {
  follow: PersonAddIcon,
  like: FavoriteIcon,
  comment: ChatBubbleOutlineIcon,
  post: PostAddOutlinedIcon,
};

const NotificationDrawer = ({ open, onClose, onUnreadChange }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await userApi.getNotifications();
        setItems(data.data.notifications);
        onUnreadChange?.(data.data.unreadCount);
        await userApi.markNotificationsRead();
        onUnreadChange?.(0);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClick = (n) => {
    onClose();
    const fromId = n.fromUser?.toString?.() || n.fromUser;
    if (n.type === 'follow') {
      if (fromId === currentUser?._id?.toString()) {
        navigate('/profile');
      } else {
        navigate(`/user/${fromId}`);
      }
      return;
    }
    navigate('/feed');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 'min(360px, 92vw)', maxWidth: 520 },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Notifications
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box flex={1} overflow="auto">
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={28} />
            </Box>
          ) : items.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No notifications yet. Follow people to see when they post!
            </Typography>
          ) : (
            <List disablePadding>
              {items.map((n) => {
                const Icon = typeIcon[n.type] || ChatBubbleOutlineIcon;
                return (
                  <ListItem key={n._id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => handleClick(n)}
                      sx={{
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                        bgcolor: n.read ? 'transparent' : 'action.hover',
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 48 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon fontSize="small" />
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={700}>
                            {n.fromUsername}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ mt: 0.25 }}>
                              {n.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatRelativeTime(n.createdAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
