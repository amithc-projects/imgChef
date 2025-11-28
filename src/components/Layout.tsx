import React from 'react';
import { Layers, Image as ImageIcon, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">
          <ImageIcon className="icon" />
          <h1>BatchImg</h1>
        </div>
        <nav>
          {/* Navigation items can go here */}
        </nav>
      </header>
      <main className="main-content">
        {children}
      </main>
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
          padding: var(--spacing-md) var(--spacing-xl);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: bold;
          font-size: 1.25rem;
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
      `}</style>
    </div>
  );
};
