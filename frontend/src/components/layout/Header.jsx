import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import useAuth from '../../hooks/useAuth';
import useThemeMode from '../../hooks/useThemeMode';
import { getInitials } from '../../utils/validators';
import * as userApi from '../../api/userApi';
import NotificationDrawer from './NotificationDrawer';

const Header = ({ title = 'Social', showStats = true }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await userApi.getNotifications();
      setUnreadCount(data.data.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    fetchUnread();
    const interval = setInterval(fetchUnread, 20000);
    const onFocus = () => fetchUnread();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, fetchUnread]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        className="app-header"
        color="inherit"
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2, gap: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1, fontSize: '1.35rem' }}>
            {title}
          </Typography>

          {showStats && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                onClick={toggleTheme}
                size="small"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
              <IconButton
                size="small"
                aria-label="Notifications"
                onClick={() => setNotifOpen(true)}
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
              <IconButton
                onClick={() => navigate('/profile')}
                aria-label="Go to profile"
                sx={{ p: 0.25 }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: user?.avatarColor || 'primary.main',
                    fontSize: 14,
                  }}
                >
                  {getInitials(user?.username)}
                </Avatar>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <NotificationDrawer
        open={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          fetchUnread();
        }}
        onUnreadChange={setUnreadCount}
      />
    </>
  );
};

export default Header;
