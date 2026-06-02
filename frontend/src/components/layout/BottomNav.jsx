import { useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const navItems = [
  { path: '/feed', icon: HomeOutlinedIcon, label: 'Home' },
  { path: '/create', icon: AddCircleOutlineIcon, label: 'Create', highlight: true },
  { path: '/profile', icon: PersonOutlineIcon, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Paper elevation={8} className="bottom-nav" sx={{ borderRadius: 0 }}>
      <Box className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <IconButton
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`bottom-nav-item${isActive ? ' bottom-nav-item--active' : ''}${
                item.highlight ? ' bottom-nav-item--create' : ''
              }`}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={0.25}>
                <Icon sx={{ fontSize: item.highlight ? 28 : 24 }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500, lineHeight: 1 }}
                >
                  {item.label}
                </Typography>
              </Box>
            </IconButton>
          );
        })}
      </Box>
    </Paper>
  );
};

export default BottomNav;
