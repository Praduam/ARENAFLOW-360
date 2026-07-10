import React, { useState } from 'react';
import { Smile, ShieldAlert, Languages, Award, Bell } from 'lucide-react';
import FanPortal from './components/FanPortal';
import StaffPortal from './components/StaffPortal';
import VolunteerPortal from './components/VolunteerPortal';
import DeveloperSettings from './components/DeveloperSettings';
import GlobalChatbot from './components/GlobalChatbot';

export default function App() {
  const [activePersona, setActivePersona] = useState('fan'); // fan, staff, volunteer

  return (
    <div className="main-content">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-section">
          <Award className="logo-icon" />
          <div>
            <h1 className="logo-text">ARENAFLOW 360</h1>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Smart Operations & Fan Hub • FIFA World Cup 2026
            </span>
          </div>
        </div>

        {/* Header Actions & Persona Switcher */}
        <div className="header-actions">
          <div className="persona-switcher">
            <button 
              className={`persona-btn ${activePersona === 'fan' ? 'active fan' : ''}`}
              onClick={() => setActivePersona('fan')}
            >
              <Smile size={16} />
              Fan Experience
            </button>
            <button 
              className={`persona-btn ${activePersona === 'staff' ? 'active staff' : ''}`}
              onClick={() => setActivePersona('staff')}
            >
              <ShieldAlert size={16} />
              Operations Dashboard
            </button>
            <button 
              className={`persona-btn ${activePersona === 'volunteer' ? 'active volunteer' : ''}`}
              onClick={() => setActivePersona('volunteer')}
            >
              <Languages size={16} />
              Volunteer Hub
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Bell size={13} style={{ color: 'var(--primary-green)' }} />
            <span>MetLife Stadium</span>
          </div>
        </div>
      </header>

      {/* Main Portals Dynamic Rendering */}
      <main style={{ flex: 1, position: 'relative' }}>
        {activePersona === 'fan' && <FanPortal />}
        {activePersona === 'staff' && <StaffPortal />}
        {activePersona === 'volunteer' && <VolunteerPortal />}
      </main>

      {/* Developer Simulator Controls Panel & Global AI Assistant */}
      <DeveloperSettings />
      <GlobalChatbot />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>
        ArenaFlow 360 © FIFA World Cup 2026 Host Venue Operations Service. Designed for MetLife Stadium, East Rutherford, NJ.
      </footer>
    </div>
  );
}
