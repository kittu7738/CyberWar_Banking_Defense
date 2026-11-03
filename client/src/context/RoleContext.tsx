import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRoleInfo } from '../types/index.js';
import { api } from '../api/client.js';

interface RoleContextType {
  activeRole: string;
  roleDetails: UserRoleInfo | null;
  rolesList: UserRoleInfo[];
  demoNotice: string;
  switchRole: (role: string) => Promise<void>;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<string>(
    localStorage.getItem('cyberwar_user_role') || 'CISO'
  );
  const [roleDetails, setRoleDetails] = useState<UserRoleInfo | null>(null);
  const [rolesList, setRolesList] = useState<UserRoleInfo[]>([]);
  const [demoNotice, setDemoNotice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await api.getRoles();
      setActiveRoleState(res.activeRole);
      setRoleDetails(res.activeRoleDetails);
      setRolesList(res.roles);
      setDemoNotice(res.demoNotice);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const switchRole = async (newRole: string) => {
    try {
      localStorage.setItem('cyberwar_user_role', newRole);
      const res = await api.switchRole(newRole);
      setActiveRoleState(res.activeRole);
      setRoleDetails(res.activeRoleDetails);
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        roleDetails,
        rolesList,
        demoNotice,
        switchRole,
        loading
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
