import React from 'react';
import { 
  GraduationCap, 
  Home, 
  UserCheck, 
  Users, 
  LayoutDashboard, 
  ShieldCheck, 
  Radio 
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, apiOnline }) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'predict', label: 'Assessment', icon: UserCheck },
    { id: 'batch', label: 'Cohort Batch', icon: Users },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'governance', label: 'Governance', icon: ShieldCheck },
  ];

  return (
    <header className="header">
      <div className="container header-container">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('landing')}>
          <div className="brand-logo">
            <GraduationCap size={22} color="#040904" />
          </div>
          <div className="brand-title">
            <span className="brand-name">EduSafe AI</span>
            <span className="brand-badge">Advisory ML</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-button ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live System Status Pill */}
        <div className="system-status">
          <div className={`status-indicator ${apiOnline ? 'online' : 'offline'}`} />
          <Radio size={13} className={apiOnline ? 'pulse-icon' : ''} />
          <span>{apiOnline ? 'API Active' : 'Connecting'}</span>
        </div>
      </div>
    </header>
  );
};
