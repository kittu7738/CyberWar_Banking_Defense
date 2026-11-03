import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Alert
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { api } from '../../api/client.js';
import { useSimulation } from '../../context/SimulationContext.js';

interface RecordObservationDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (msg: string) => void;
}

export const RecordObservationDialog: React.FC<RecordObservationDialogProps> = ({
  open,
  onClose,
  onSaved
}) => {
  const { refreshState } = useSimulation();
  const [category, setCategory] = useState<string>('RESILIENCE');
  const [severity, setSeverity] = useState<string>('MATTER_REQUIRING_ATTENTION');
  const [examinerName, setExaminerName] = useState<string>('Federal Supervisory Examination Unit');
  const [finding, setFinding] = useState<string>('');
  const [actionRequired, setActionRequired] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!finding.trim()) {
      setError('Please provide the supervisory finding details.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.addObservation({
        category,
        severity,
        examinerName,
        finding: finding.trim(),
        actionRequired: actionRequired.trim() || 'Remediate within next statutory audit cycle.'
      });
      await refreshState();
      onSaved(`Supervisory observation recorded: [${severity}] ${category}`);
      onClose();
      setFinding('');
      setActionRequired('');
    } catch (err: any) {
      setError(err.message || 'Failed to record observation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
        <AccountBalanceIcon sx={{ color: '#7c3aed' }} />
        Record Formal Supervisory Observation
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
          Log statutory supervisory findings, Matters Requiring Attention (MRAs), or operational resilience recommendations into the institutional audit record.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Supervisory Authority / Examiner Unit"
            size="small"
            fullWidth
            value={examinerName}
            onChange={(e) => setExaminerName(e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="RESILIENCE">Operational Resilience (DORA / FFIEC)</MenuItem>
                <MenuItem value="GOVERNANCE">Board Cybersecurity Governance</MenuItem>
                <MenuItem value="INCIDENT_RESPONSE">Incident Notification & Containment</MenuItem>
                <MenuItem value="THIRD_PARTY">Third-Party & SWIFT Dependency</MenuItem>
                <MenuItem value="CAPITAL_ADEQUACY">Cyber Capital Adequacy</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Supervisory Severity</InputLabel>
              <Select
                value={severity}
                label="Supervisory Severity"
                onChange={(e) => setSeverity(e.target.value)}
              >
                <MenuItem value="MATTER_REQUIRING_ATTENTION">Matter Requiring Attention (MRA)</MenuItem>
                <MenuItem value="DEFICIENCY">Supervisory Deficiency</MenuItem>
                <MenuItem value="RECOMMENDATION">Remediation Recommendation</MenuItem>
                <MenuItem value="COMPLIANT">Verified Compliant</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Detailed Supervisory Finding"
            multiline
            rows={3}
            fullWidth
            required
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            placeholder="e.g. Critical path analysis indicates Customer Database (asset-customer-db) lacks verified continuous replication..."
          />

          <TextField
            label="Mandated Remediation Action"
            multiline
            rows={2}
            fullWidth
            value={actionRequired}
            onChange={(e) => setActionRequired(e.target.value)}
            placeholder="e.g. Implement Immutable Snapshot Backups and conduct RTO recovery drill by Q3."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, fontWeight: 700 }}
        >
          {submitting ? 'Recording...' : 'Record Observation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
