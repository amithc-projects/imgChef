import React, { useState, useMemo } from 'react';
import { transformationRegistry } from '../core/Registry';
import { TransformationDefinition } from '../core/types';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Wand2,      // AI
  Palette,    // Color
  Sliders,    // Filters
  Crop,       // Geometry
  Type,       // Text
  FileJson,   // Metadata
  Workflow,   // Workflow
  Box         // Other
} from 'lucide-react';

interface LibrarySidebarProps {
  onAddStep: (transformationId: string) => void;
}

// 1. Helper to categorize transformations based on ID prefix
const getCategory = (t: TransformationDefinition) => {
  const id = t.id;
  if (id.startsWith('ai-')) return 'AI & Smart';
  if (id.startsWith('color-')) return 'Color Correction';
  if (id.startsWith('filter-')) return 'Filters & Effects';
  if (id.startsWith('geo-') || id.startsWith('geometry-')) return 'Geometry';
  if (id.startsWith('text-')) return 'Text & Overlays';
  if (id.startsWith('meta-')) return 'Metadata';
  if (id.startsWith('workflow-')) return 'Workflow';
  return 'Other';
};

// 2. Helper for icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'AI & Smart': return <Wand2 size={16} />;
    case 'Color Correction': return <Palette size={16} />;
    case 'Filters & Effects': return <Sliders size={16} />;
    case 'Geometry': return <Crop size={16} />;
    case 'Text & Overlays': return <Type size={16} />;
    case 'Metadata': return <FileJson size={16} />;
    case 'Workflow': return <Workflow size={16} />;
    default: return <Box size={16} />;
  }
};

export const LibrarySidebar: React.FC<LibrarySidebarProps> = ({ onAddStep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // b) Groups shown closed by default (empty set)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const transformations = transformationRegistry.getAll();

  // a) Grouping & Filtering
  const groupedTransformations = useMemo(() => {
    const groups: Record<string, TransformationDefinition[]> = {};
    let hasMatches = false;

    transformations.forEach(t => {
      // b) Text search capability
      if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }
      hasMatches = true;

      const cat = getCategory(t);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });

    return groups;
  }, [searchTerm]);

  const toggleGroup = (group: string) => {
    const next = new Set(expandedGroups);
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    setExpandedGroups(next);
  };

  // Auto-expand groups if searching
  React.useEffect(() => {
    if (searchTerm) {
      setExpandedGroups(new Set(Object.keys(groupedTransformations)));
    } else {
      setExpandedGroups(new Set()); // Reset to collapsed when search cleared
    }
  }, [searchTerm]); // Dependency on searchTerm implies logic runs on type

  // Defined order for consistency
  const categories = [
    'AI & Smart',
    'Geometry',
    'Color Correction',
    'Filters & Effects',
    'Text & Overlays',
    'Metadata',
    'Workflow',
    'Other'
  ];

  return (
    <div className="library-sidebar">
      <div className="library-header">
        <h3>Library</h3>
        <div className="search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="library-list">
        {categories.map(cat => {
          const items = groupedTransformations[cat];
          if (!items || items.length === 0) return null;

          const isExpanded = expandedGroups.has(cat);

          return (
            <div key={cat} className="library-group">
              <div className="group-header" onClick={() => toggleGroup(cat)}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="group-icon">{getCategoryIcon(cat)}</span>
                <span className="group-name">{cat}</span>
                <span className="group-count">{items.length}</span>
              </div>

              {isExpanded && (
                <div className="group-items">
                  {items.map(t => (
                    <div
                      key={t.id}
                      className="library-item"
                      onClick={() => onAddStep(t.id)}
                      title={t.description} /* c) Tooltip with description */
                    >
                      <div className="library-item-header">
                        <span className="library-item-name">{t.name}</span>
                        <Plus size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedTransformations).length === 0 && (
          <div className="empty-search">No transformations found.</div>
        )}
      </div>

      <style>{`
                .library-sidebar {
                    width: 250px;
                    background: var(--color-bg-secondary);
                    border-right: 1px solid var(--color-border);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .library-header {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border);
                }
                .library-header h3 {
                    margin: 0 0 var(--spacing-sm) 0;
                    font-size: 1rem;
                }
                .search-box {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-icon {
                    position: absolute;
                    right: 8px;
                    color: var(--color-text-secondary);
                }
                .search-box input {
                    width: 100%;
                    padding: 6px 8px 6px 28px;
                    border-radius: 4px;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg-primary);
                    color: var(--color-text-primary);
                    font-size: 0.85rem;
                }
                .search-box input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
                .library-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-sm);
                }
                .library-group {
                    margin-bottom: 2px;
                }
                .group-header {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 4px;
                    color: var(--color-text-primary);
                    font-weight: 500;
                    font-size: 0.9rem;
                    user-select: none;
                }
                .group-header:hover {
                    background: var(--color-bg-tertiary);
                }
                .group-icon {
                    margin: 0 8px;
                    color: var(--color-text-secondary);
                    display: flex;
                }
                .group-name {
                    flex: 1;
                }
                .group-count {
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                    background: var(--color-bg-primary);
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 20px;
                    text-align: center;
                }
                .group-items {
                    padding-left: 12px;
                    padding-top: 2px;
                    padding-bottom: 8px;
                }
                .library-item {
                    padding: 8px 12px;
                    margin: 2px 0;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.1s;
                    border-left: 2px solid transparent;
                }
                .library-item:hover {
                    background: var(--color-bg-tertiary);
                    border-left-color: var(--color-primary);
                }
                .library-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .library-item-name {
                    font-size: 0.85rem;
                }
                .empty-search {
                    padding: 20px;
                    text-align: center;
                    color: var(--color-text-secondary);
                    font-style: italic;
                    font-size: 0.9rem;
                }
            `}</style>
    </div>
  );
};