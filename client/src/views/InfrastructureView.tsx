import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useSimulation } from '../context/SimulationContext.js';
import { D3NetworkGraph } from '../components/NetworkGraph/D3NetworkGraph.js';
import { BankingAsset } from '../types/index.js';

export const InfrastructureView: React.FC = () => {
  const { state } = useSimulation();
  const [selectedAsset, setSelectedAsset] = useState<BankingAsset | null>(
    state?.assets ? state.assets[0] : null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('CRITICALITY');

  if (!state) return null;

  // Filter and sort assets
  const filteredAssets = state.assets
    .filter(a => {
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.ipSubnet.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (tierFilter !== 'ALL' && a.tier !== tierFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'HEALTH') return a.healthScore - b.healthScore;
      if (sortBy === 'EXPOSURE') return b.financialExposureEstimate - a.financialExposureEstimate;
      if (sortBy === 'VULN') return b.vulnerabilityLevel - a.vulnerabilityLevel;
      // Default: Criticality weight
      const critOrder = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
      return critOrder[b.criticality] - critOrder[a.criticality];
    });

  const appliedControls = selectedAsset
    ? state.controls.filter(c => selectedAsset.appliedControls.includes(c.id))
    : [];

  const dependencyAssets = selectedAsset
    ? state.assets.filter(a => selectedAsset.dependencies.includes(a.id))
    : [];

  const dependentAssets = selectedAsset
    ? state.assets.filter(a => selectedAsset.dependents.includes(a.id))
    : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* View Header with Search, Filter & Sort Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HubIcon sx={{ color: '#0284c7' }} />
            Banking Infrastructure Topology Map
          </Typography>
        </Box>

        {/* Filter & Search Bar */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search assets or subnets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              )
            }}
            sx={{ bgcolor: '#ffffff', width: 220, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ color: '#64748b', fontSize: '0.8rem' }}>Tier</InputLabel>
            <Select
              value={tierFilter}
              label="Tier"
              onChange={(e) => setTierFilter(e.target.value)}
              sx={{ bgcolor: '#ffffff', color: '#0f172a', fontSize: '0.82rem' }}
            >
              <MenuItem value="ALL">All Tiers ({state.assets.length})</MenuItem>
              <MenuItem value="DMZ">DMZ</MenuItem>
              <MenuItem value="APPLICATION">Application</MenuItem>
              <MenuItem value="DATA_SECURE">Secure Data</MenuItem>
              <MenuItem value="THIRD_PARTY">Third-Party</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: '#64748b', fontSize: '0.8rem' }}>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ bgcolor: '#ffffff', color: '#0f172a', fontSize: '0.82rem' }}
            >
              <MenuItem value="CRITICALITY">Criticality</MenuItem>
              <MenuItem value="HEALTH">Health (Lowest First)</MenuItem>
              <MenuItem value="EXPOSURE">Financial Exposure</MenuItem>
              <MenuItem value="VULN">CVE Vulnerability</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Main Grid: D3 Network Canvas on Left, Asset Inspector on Right */}
      <Grid container spacing={3}>
        {/* D3 Graph Canvas */}
        <Grid item xs={12} lg={8}>
          <D3NetworkGraph
            assets={filteredAssets}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            height={620}
          />
        </Grid>

        {/* Selected Asset Details Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 620, overflowY: 'auto' }}>
            <CardContent sx={{ p: 2.5 }}>
              {selectedAsset ? (() => {
                const effectiveStatus = (selectedAsset.healthScore === 0 && (selectedAsset.operationalStatus === 'DEGRADED' || selectedAsset.operationalStatus === 'HEALTHY'))
                  ? 'COMPROMISED'
                  : selectedAsset.operationalStatus;

                return (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {selectedAsset.name}
                    </Typography>
                    <Chip
                      label={effectiveStatus}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor:
                          effectiveStatus === 'HEALTHY' ? '#ecfdf5' :
                          effectiveStatus === 'DEGRADED' ? '#fffbeb' :
                          effectiveStatus === 'OFFLINE' ? '#f1f5f9' : '#fef2f2',
                        color:
                          effectiveStatus === 'HEALTHY' ? '#059669' :
                          effectiveStatus === 'DEGRADED' ? '#d97706' :
                          effectiveStatus === 'OFFLINE' ? '#475569' : '#dc2626'
                      }}
                    />
                  </Box>

                  <Typography variant="caption" sx={{ color: '#0284c7', fontFamily: '"JetBrains Mono", monospace', display: 'block', mb: 1.5 }}>
                    ID: {selectedAsset.id} | Tier: {selectedAsset.tier}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.82rem' }}>
                    {selectedAsset.description}
                  </Typography>

                  <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                  {/* Operational Metrics */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    SECURITY & RECOVERY METRICS
                  </Typography>

                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Health Score</Typography>
                        <Typography variant="body1" sx={{
                          fontWeight: 800,
                          color: selectedAsset.healthScore >= 80 ? '#059669' : selectedAsset.healthScore >= 50 ? '#d97706' : '#dc2626',
                          fontFamily: '"JetBrains Mono", monospace'
                        }}>
                          {selectedAsset.healthScore}%
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>CVE Vulnerability</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#0284c7', fontFamily: '"JetBrains Mono", monospace' }}>
                          {selectedAsset.vulnerabilityLevel} / 100
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Target RTO</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"JetBrains Mono", monospace' }}>
                          {selectedAsset.rtoHours} hrs
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Target RPO</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: '"JetBrains Mono", monospace' }}>
                          {selectedAsset.rpoHours} hrs
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Financial Exposure Estimate</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#d97706', fontFamily: '"JetBrains Mono", monospace' }}>
                          ${selectedAsset.financialExposureEstimate.toLocaleString()} USD
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                  {/* Applied Controls */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    APPLIED DEFENSES ({appliedControls.length})
                  </Typography>

                  {appliedControls.length === 0 ? (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', mb: 2 }}>
                      No active defense controls covering this asset.
                    </Typography>
                  ) : (
                    <Stack spacing={0.8} sx={{ mb: 2 }}>
                      {appliedControls.map(c => (
                        <Box key={c.id} sx={{ p: 1, bgcolor: '#f0f9ff', borderRadius: 1.5, border: '1px solid #bae6fd' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284c7', display: 'block' }}>
                            {c.name}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}

                  <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                  {/* Network Topology Links */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    DEPENDENCIES & IMPACTS
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Relies Upon ({dependencyAssets.length} Upstream):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.5 }}>
                    {dependencyAssets.length === 0 ? (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>None (Root node)</Typography>
                    ) : (
                      dependencyAssets.map(a => (
                        <Chip
                          key={a.id}
                          label={a.name.split(' ')[0]}
                          size="small"
                          onClick={() => setSelectedAsset(a)}
                          sx={{ fontSize: '0.72rem', bgcolor: '#f1f5f9', cursor: 'pointer' }}
                        />
                      ))
                    )}
                  </Box>

                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Impacts ({dependentAssets.length} Downstream):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                    {dependentAssets.length === 0 ? (
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>None (Leaf node)</Typography>
                    ) : (
                      dependentAssets.map(a => (
                        <Chip
                          key={a.id}
                          label={a.name.split(' ')[0]}
                          size="small"
                          onClick={() => setSelectedAsset(a)}
                          sx={{ fontSize: '0.72rem', bgcolor: '#f1f5f9', cursor: 'pointer' }}
                        />
                      ))
                    )}
                  </Box>
                </>
              );
              })() : (
                <Box sx={{ py: 12, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Click any node on the D3 network map to inspect details.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
