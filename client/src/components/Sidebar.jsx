import { useState } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const DRAWER_WIDTH = 260;

export default function Sidebar({ navItems, portalName, portalColor }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Group items by sections
  const sections = [];
  let currentSection = { label: null, items: [] };

  navItems.forEach((item) => {
    if (item.divider) {
      if (currentSection.items.length > 0 || currentSection.label === null) {
        sections.push(currentSection);
      }
      currentSection = { label: item.label, items: [] };
    } else {
      currentSection.items.push(item);
    }
  });
  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // Auto-expand section that contains the active route
  const getInitialState = () => {
    const state = {};
    sections.forEach((sec) => {
      if (sec.label) {
        const hasActive = sec.items.some((it) => location.pathname === it.path);
        state[sec.label] = hasActive;
      }
    });
    return state;
  };

  const [expanded, setExpanded] = useState(getInitialState);

  const toggle = (label) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar sx={{ py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#E60000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1 }}>V</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#E60000', fontWeight: 700, lineHeight: 1.2 }}>Vodacom</Typography>
            <Typography variant="caption" sx={{ color: portalColor || 'primary.main', fontWeight: 600, lineHeight: 1.2 }}>
              {portalName}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <List sx={{ px: 1, overflow: 'auto', pb: 2 }} disablePadding>
        {sections.map((section, sIdx) => {
          // Top-level items (no section label, e.g. Dashboard)
          if (!section.label) {
            return section.items.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{ borderRadius: 2, mb: 0.5, py: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
              </ListItemButton>
            ));
          }

          const isOpen = expanded[section.label] ?? false;
          const hasActive = section.items.some((it) => location.pathname === it.path);

          return (
            <Box key={section.label}>
              <ListItemButton
                onClick={() => toggle(section.label)}
                sx={{
                  borderRadius: 2,
                  mt: sIdx > 0 ? 0.5 : 0,
                  mb: 0.25,
                  py: 0.4,
                  bgcolor: hasActive ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: hasActive ? 'primary.main' : 'text.disabled',
                    letterSpacing: '0.05em',
                  }}
                />
                {isOpen
                  ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                }
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 0.5 }}>
                  {section.items.map((item) => (
                    <ListItemButton
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{ borderRadius: 2, mb: 0.25, py: 0.35 }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.82rem' }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
