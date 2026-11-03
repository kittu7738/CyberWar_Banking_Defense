import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import MemoryIcon from '@mui/icons-material/Memory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorageIcon from '@mui/icons-material/Storage';
import { useSimulation } from '../../context/SimulationContext.js';
import { useRole } from '../../context/RoleContext.js';
import { RiskBadge } from '../Common/RiskBadge.js';
import { ROLE_CAPABILITIES, RoleId } from '../../utils/rolePermissions.js';

interface HeaderProps {
  currentView: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { state } = useSimulation();
  const { activeRole, rolesList, switchRole } = useRole();

  const continuityStatus = state?.businessContinuityStatus || 'NORMAL';
  const continuityColor = 
    continuityStatus === 'NORMAL' ? '#059669' :
    continuityStatus === 'DEGRADED_OPERATIONS' ? '#d97706' :
    continuityStatus === 'FAILOVER_ACTIVE' ? '#0284c7' : '#dc2626';

  const continuityBg = 
    continuityStatus === 'NORMAL' ? '#ecfdf5' :
    continuityStatus === 'DEGRADED_OPERATIONS' ? '#fffbeb' :
    continuityStatus === 'FAILOVER_ACTIVE' ? '#f0f9ff' : '#fef2f2';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
        zIndex: 1200
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, md: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
            }}
          >
            <ShieldIcon fontSize="small" />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              CYBERWAR BANKING DEFENSE
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#0284c7',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em'
                }}
              >
                COMMAND CENTER
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Live Metrics Header Bar */}
        <Stack direction="row" spacing={2.5} alignItems="center">
          {state && (
            <>
              {/* Round Badge */}
              <Tooltip title="Current active simulation round out of 5 total rounds" arrow>
                <Chip
                  icon={<MemoryIcon style={{ color: '#0284c7', fontSize: 16 }} />}
                  label={`ROUND ${state.currentRound} / ${state.maxRounds}`}
                  size="small"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    bgcolor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    color: '#0284c7'
                  }}
                />
              </Tooltip>

              {/* Operational Health */}
              <Tooltip title="Bank Aggregate Operational Health across all connected banking services" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    HEALTH:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      color: state.operationalHealth >= 80 ? '#059669' : state.operationalHealth >= 50 ? '#d97706' : '#dc2626'
                    }}
                  >
                    {state.operationalHealth}%
                  </Typography>
                </Box>
              </Tooltip>

              {/* Risk Level */}
              <RiskBadge level={state.riskLevel} score={state.overallRiskScore} />

              {/* Business Continuity */}
              <Chip
                label={continuityStatus.replace('_', ' ')}
                size="small"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: continuityColor,
                  border: `1px solid ${continuityColor}40`,
                  bgcolor: continuityBg
                }}
              />
            </>
          )}

          {/* User Role Switcher */}
          <FormControl size="small" sx={{ minWidth: 210 }}>
            <InputLabel id="role-select-label" sx={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700 }}>
              Perspective Role
            </InputLabel>
            <Select
              labelId="role-select-label"
              value={activeRole}
              label="Perspective Role"
              onChange={(e) => switchRole(e.target.value)}
              sx={{
                bgcolor: '#ffffff',
                color: '#0f172a',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: 2,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#cbd5e1'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0284c7'
                }
              }}
              renderValue={(val) => {
                const cap = ROLE_CAPABILITIES[val as RoleId];
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label={cap?.badge || val}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        bgcolor: cap?.badgeBg || '#f1f5f9',
                        color: cap?.badgeColor || '#0284c7'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {cap?.title?.split(' ')[0] || val}
                    </Typography>
                  </Box>
                );
              }}
            >
              <MenuItem value="CISO" sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <ShieldIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>CISO (Chief Information Security Officer)</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Cyber operations, defense budget, incident response</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="RED_TEAM" sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <WarningAmberIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Adversary Simulation Lead (Red Team)</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Attack vectors, target surface, evasion telemetry</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="REGULATOR" sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <AccountBalanceIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Financial Supervisory Authority</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Resilience governance, audit inspection, compliance</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="INSURER" sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Cyber Risk Underwriter</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Financial exposure, actuarial curves, loss claims</Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="INFRA_OFFICER" sx={{ fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <StorageIcon sx={{ fontSize: 18, color: '#059669' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Business Continuity Director</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Core banking uptime, RTO/RPO SLAs, DR failover</Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
