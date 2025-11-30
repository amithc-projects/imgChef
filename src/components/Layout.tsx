import React, { useState } from 'react';
import { Layers, Image as ImageIcon, Settings, Menu, HelpCircle, Shield, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <ImageIcon className="icon" size={20} />
          <h1>BatchImg</h1>
        </div>
        <nav className="nav-right">
          <div className="menu-container">
            <button
              className="btn-icon menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">
                <a href="#" className="menu-item">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </a>
                <a href="#" className="menu-item">
                  <Shield size={16} />
                  <span>Privacy</span>
                </a>
                <a href="#" className="menu-item">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
              </div>
            )}
          </div>
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
      {isMenuOpen && (
        <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: var(--color-bg-primary);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm) var(--spacing-lg); /* Reduced padding */
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          height: 50px; /* Fixed compact height */
        }
        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: bold;
          font-size: 1.1rem; /* Slightly smaller */
          color: var(--color-text-primary);
        }
        .icon {
          color: var(--color-primary);
        }
        .main-content {
          flex: 1;
          overflow: hidden;
          display: flex;
        }
        .nav-right {
          display: flex;
          align-items: center;
        }
        .menu-container {
          position: relative;
        }
        .menu-trigger {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .menu-trigger:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 160px;
          z-index: 1001;
          overflow: hidden;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--color-text-primary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: background-color 0.1s;
        }
        .menu-item:hover {
          background-color: var(--color-bg-tertiary);
        }
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: transparent;
        }
      `}</style>
    </div>
  );
};
