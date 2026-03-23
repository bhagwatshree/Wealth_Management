import { Box, AppBar, Toolbar, Typography, IconButton, Chip, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import { useAuth, ROLE_LABELS } from '../hooks/useAuth';

export default function AppLayout({ navItems, portalName, portalColor }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar navItems={navItems} portalName={portalName} portalColor={portalColor} />
      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px` }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
              <Typography variant="h6">{portalName}</Typography>
              <Chip
                label="M-Pesa"
                size="small"
                sx={{
                  bgcolor: '#4CAF50',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 22,
                }}
              />
            </Stack>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">{user.name}</Typography>
                <Chip label={ROLE_LABELS[user.role]} size="small" sx={{ borderColor: '#E60000', color: '#E60000' }} variant="outlined" />
                <IconButton size="small" onClick={handleLogout} title="Logout">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
