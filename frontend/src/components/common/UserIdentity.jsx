import { Avatar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDisplayName, formatHandle, getColorFromUsername } from '../../utils/userDisplay';
import { getInitials } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';

const UserIdentity = ({
  username = '',
  userId,
  avatarColor,
  size = 'medium',
  showHandle = true,
  subtitle,
  avatarOnly = false,
  clickable = true,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const displayName = formatDisplayName(username);
  const handle = formatHandle(username);
  const bgcolor = avatarColor || getColorFromUsername(username);

  const avatarSize = size === 'small' ? 36 : size === 'large' ? 48 : 40;
  const fontSize = size === 'small' ? 14 : size === 'large' ? 17 : 15;

  const goToProfile = () => {
    if (!clickable || !userId) return;
    const id = userId?.toString?.() || userId;
    const me = currentUser?._id?.toString();
    if (me && id === me) {
      navigate('/profile');
    } else {
      navigate(`/user/${id}`);
    }
  };

  const interactiveSx = clickable && userId
    ? {
        cursor: 'pointer',
        borderRadius: 2,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
      }
    : {};

  if (avatarOnly) {
    return (
      <Avatar
        onClick={goToProfile}
        sx={{
          width: avatarSize,
          height: avatarSize,
          bgcolor,
          fontSize,
          ...(clickable && userId ? { cursor: 'pointer' } : {}),
        }}
      >
        {getInitials(username)}
      </Avatar>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      gap={1.25}
      minWidth={0}
      onClick={goToProfile}
      role={clickable && userId ? 'button' : undefined}
      tabIndex={clickable && userId ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && userId && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          goToProfile();
        }
      }}
      sx={{ ...interactiveSx, p: clickable && userId ? 0.5 : 0, m: clickable && userId ? -0.5 : 0 }}
    >
      <Avatar sx={{ width: avatarSize, height: avatarSize, bgcolor, fontSize, flexShrink: 0 }}>
        {getInitials(username)}
      </Avatar>
      <Box minWidth={0} flex={1}>
        <Typography
          variant={size === 'large' ? 'subtitle1' : 'subtitle2'}
          fontWeight={700}
          lineHeight={1.25}
          noWrap
        >
          {displayName}
        </Typography>
        {showHandle && (
          <Typography
            variant="body2"
            color="primary.main"
            fontWeight={500}
            lineHeight={1.3}
            noWrap
            sx={{ fontSize: size === 'small' ? '0.75rem' : '0.8rem' }}
          >
            {handle}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserIdentity;
