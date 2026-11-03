import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { RiskLevel } from '../../types/index.js';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'small' | 'medium';
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; tooltip: string }> = {
  LOW: {
    label: 'Low Risk',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    tooltip: 'Score 0-24: Robust multi-layer defenses, negligible critical exposure, isolated blast radius.'
  },
  MEDIUM: {
    label: 'Moderate Risk',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    tooltip: 'Score 25-49: Baseline compliance active, minor vulnerability gaps in perimeter tiers.'
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    tooltip: 'Score 25-49: Baseline compliance active, minor vulnerability gaps in perimeter tiers.'
  },
  HIGH: {
    label: 'High Risk',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    tooltip: 'Score 50-74: Significant control bypass potential, vulnerable single points of failure.'
  },
  CRITICAL: {
    label: 'Critical Risk',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    tooltip: 'Score 75-100: Immediate systemic breach danger, core banking ledger or settlement rail exposed.'
  }
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'small' }) => {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.MODERATE;
  const labelText = score !== undefined ? `${cfg.label} (${score})` : cfg.label;

  return (
    <Tooltip title={cfg.tooltip} arrow placement="top">
      <Chip
        label={labelText}
        size={size}
        sx={{
          color: cfg.color,
          backgroundColor: cfg.bg,
          border: `1px solid ${cfg.border}`,
          fontWeight: 700,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: size === 'small' ? '0.75rem' : '0.85rem'
        }}
      />
    </Tooltip>
  );
};
