import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HubIcon from '@mui/icons-material/Hub';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useRole } from '../../context/RoleContext.js';
import { ROLE_CAPABILITIES, RoleId } from '../../utils/rolePermissions.js';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  drawerWidth?: number;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { id: 'infrastructure', label: 'Banking Infrastructure', icon: <HubIcon fontSize="small" />, badge: '10+ Assets' },
  { id: 'simulator', label: 'Attack Simulator', icon: <WarningAmberIcon fontSize="small" />, badge: 'DDoS' },
  { id: 'defense', label: 'Defense Allocation', icon: <SecurityIcon fontSize="small" />, badge: 'Optimizer' },
  { id: 'incident', label: 'Incident Response', icon: <SupportAgentIcon fontSize="small" />, badge: 'NIST' },
  { id: 'risk', label: 'Risk Analysis', icon: <AccountTreeIcon fontSize="small" /> },
  { id: 'reports', label: 'Reports', icon: <AssessmentIcon fontSize="small" /> }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  drawerWidth = 260
}) => {
  const { roleDetails } = useRole();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          top: 64,
          height: 'calc(100% - 64px)'
        }
      }}
    >
      {/* Role Focus Panel in Sidebar */}
      {roleDetails && (() => {
        const cap = ROLE_CAPABILITIES[roleDetails.role as RoleId] || ROLE_CAPABILITIES.CISO;
        return (
          <Box sx={{
            p: 2,
            m: 1.5,
            bgcolor: cap.badgeBg,
            borderRadius: 2.5,
            border: `1px solid ${cap.badgeColor}30`,
            boxShadow: `0 2px 8px ${cap.badgeColor}12`
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: cap.badgeColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ACTIVE PERSPECTIVE
              </Typography>
              <Chip
                label={cap.badge}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: '#ffffff',
                  color: cap.badgeColor,
                  border: `1px solid ${cap.badgeColor}40`
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.2 }}>
              {roleDetails.title.split('(')[0]}
            </Typography>
          </Box>
        );
      })()}

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      <List sx={{ px: 1, py: 1.5 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => onSelectView(item.id)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  position: 'relative',
                  backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                  border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                  borderLeft: isActive ? '3.5px solid #0284c7' : '3.5px solid transparent',
                  color: isActive ? '#0284c7' : '#475569',
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    backgroundColor: isActive ? '#f0f9ff' : '#f8fafc',
                    color: '#0284c7'
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: isActive ? '#0284c7' : '#94a3b8'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 700 : 500
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: isActive ? '#e0f2fe' : '#f1f5f9',
                      color: isActive ? '#0284c7' : '#64748b'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.02em' }}>
            Simulation Engine Online
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
          Synthetic Financial Resilience
        </Typography>
      </Box>
    </Drawer>
  );
};
