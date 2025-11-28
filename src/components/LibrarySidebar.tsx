import React from 'react';
import { transformationRegistry } from '../core/Registry';
import { Plus } from 'lucide-react';

interface LibrarySidebarProps {
    onAddStep: (transformationId: string) => void;
}

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ onAddStep }) => {
    const transformations = transformationRegistry.getAll();

    return (
        <div className="library-sidebar">
            <h3>Library</h3>
            <div className="library-list">
                {transformations.map((t) => (
                    <div key={t.id} className="library-item" onClick={() => onAddStep(t.id)}>
                        <div className="library-item-header">
                            <span className="library-item-name">{t.name}</span>
                            <Plus size={16} />
                        </div>
                        <p className="library-item-desc">{t.description}</p>
                    </div>
                ))}
            </div>
            <style>{`
        .library-sidebar {
          width: 250px;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
        }
        .library-sidebar h3 {
          padding: var(--spacing-md);
          margin: 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 1rem;
        }
        .library-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-sm);
        }
        .library-item {
          padding: var(--spacing-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          cursor: pointer;
          transition: border-color var(--transition-fast);
        }
        .library-item:hover {
          border-color: var(--color-primary);
        }
        .library-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xs);
        }
        .library-item-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
        .library-item-desc {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          margin: 0;
        }
      `}</style>
        </div>
    );
};
