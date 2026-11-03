import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightCommandCenterTheme } from './theme.js';
import { RoleProvider } from './context/RoleContext.js';
import { SimulationProvider } from './context/SimulationContext.js';
import { Header } from './components/Layout/Header.js';
import { Sidebar } from './components/Layout/Sidebar.js';

import { DashboardView } from './views/DashboardView.js';
import { InfrastructureView } from './views/InfrastructureView.js';
import { AttackSimulatorView } from './views/AttackSimulatorView.js';
import { DefenseAllocationView } from './views/DefenseAllocationView.js';
import { IncidentResponseView } from './views/IncidentResponseView.js';
import { SystemicRiskView } from './views/SystemicRiskView.js';
import { ReportsHistoryView } from './views/ReportsHistoryView.js';

const SIDEBAR_WIDTH = 250;

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => setCurrentView(view)} />;
      case 'infrastructure':
        return <InfrastructureView />;
      case 'simulator':
        return <AttackSimulatorView />;
      case 'defense':
        return <DefenseAllocationView />;
      case 'incident':
        return <IncidentResponseView />;
      case 'risk':
        return <SystemicRiskView />;
      case 'reports':
        return <ReportsHistoryView />;
      default:
        return <DashboardView onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  return (
    <ThemeProvider theme={lightCommandCenterTheme}>
      <CssBaseline />
      <RoleProvider>
        <SimulationProvider>
          <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            {/* Top Fixed Header */}
            <Header currentView={currentView} />

            {/* Content Row: Sidebar + Main Content */}
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              {/* Left Sidebar */}
              <Sidebar
                currentView={currentView}
                onSelectView={(view) => setCurrentView(view)}
                drawerWidth={SIDEBAR_WIDTH}
              />

              {/* Main Content Area */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
                  minHeight: 'calc(100vh - 64px)',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#f8fafc',
                  overflowY: 'auto'
                }}
              >
                {renderCurrentView()}
              </Box>
            </Box>
          </Box>
        </SimulationProvider>
      </RoleProvider>
    </ThemeProvider>
  );
};

export default App;
