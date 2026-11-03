import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  LinearProgress,
  Chip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSimulation } from '../../context/SimulationContext.js';

interface FailoverDrillDialogProps {
  open: boolean;
  onClose: () => void;
  onExecuted: (msg: string) => void;
}

export const FailoverDrillDialog: React.FC<FailoverDrillDialogProps> = ({
  open,
  onClose,
  onExecuted
}) => {
  const { state, refreshState } = useSimulation();
  const [running, setRunning] = useState<boolean>(false);
  const [drillComplete, setDrillComplete] = useState<boolean>(false);

  if (!state) return null;

  const degradedAssets = state.assets.filter(a => a.operationalStatus !== 'HEALTHY');
  const hasImmutableBackup = state.controls.some(c => c.id === 'ctrl-backup-recovery' && c.active);

  const handleExecuteFailover = async () => {
    setRunning(true);
    setTimeout(async () => {
      setRunning(false);
      setDrillComplete(true);
      await refreshState();
      onExecuted('Disaster Recovery Hot-Site Failover Drill executed. Core Banking and Gateway pipelines synchronized.');
    }, 1200);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
        <StorageIcon sx={{ color: '#059669' }} />
        Disaster Recovery & Hot-Site Failover Drill
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
          Initiate simulated traffic redirection to secondary geographically-dispersed warm standby datacenter to preserve core banking transaction continuity.
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Service Continuity Diagnostic
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
                Disrupted / Degraded Banking Services:
              </Typography>
              <Chip
                label={`${degradedAssets.length} Services Disrupted`}
                size="small"
                sx={{
                  bgcolor: degradedAssets.length > 0 ? '#fef2f2' : '#ecfdf5',
                  color: degradedAssets.length > 0 ? '#dc2626' : '#059669',
                  fontWeight: 800
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#0f172a', fontWeight: 600 }}>
                Immutable Snapshot Backup Verification:
              </Typography>
              <Chip
                label={hasImmutableBackup ? 'VERIFIED (15-min RPO)' : 'UNCONFIGURED (Control Missing)'}
                size="small"
                sx={{
                  bgcolor: hasImmutableBackup ? '#ecfdf5' : '#fffbeb',
                  color: hasImmutableBackup ? '#059669' : '#d97706',
                  fontWeight: 800
                }}
              />
            </Box>
          </Box>

          {running && (
            <Box sx={{ py: 2 }}>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mb: 1, display: 'block' }}>
                Re-routing DNS Anycast routes to Secondary Disaster Recovery Site...
              </Typography>
              <LinearProgress color="success" />
            </Box>
          )}

          {drillComplete && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              DR Failover Simulation Successful: Traffic redirected to Secondary Hot-Site. Simulated RTO: 32 minutes (Well within statutory 4-hour SLA).
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
        {!drillComplete && (
          <Button
            variant="contained"
            color="success"
            onClick={handleExecuteFailover}
            disabled={running}
            sx={{ fontWeight: 700 }}
          >
            {running ? 'Executing Failover...' : 'Execute Failover Drill'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
