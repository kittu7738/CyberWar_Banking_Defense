import React from 'react';
import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  tooltipText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#0284c7',
  tooltipText
}) => {
  const content = (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 8px 24px -4px ${color}22`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Top Accent Gradient Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          background: `linear-gradient(90deg, ${color} 0%, ${color}40 100%)`
        }}
      />
      <CardContent sx={{ p: 2.5, pt: 2.75, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 800,
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
          </Box>
          {icon && (
            <Box
              sx={{
                color,
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                borderRadius: 1.5,
                bgcolor: `${color}10`,
                border: `1px solid ${color}20`
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"JetBrains Mono", monospace',
            color: '#0f172a',
            letterSpacing: '-0.02em',
            mb: 0.5
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontSize: '0.78rem',
              fontWeight: 500,
              fontFamily: subtitle.includes('$') || subtitle.includes('%') ? '"JetBrains Mono", monospace' : 'inherit'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return tooltipText ? (
    <Tooltip title={tooltipText} arrow placement="top">
      {content}
    </Tooltip>
  ) : (
    content
  );
};
