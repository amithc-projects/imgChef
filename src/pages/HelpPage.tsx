import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { transformationRegistry } from '../core/Registry';
import { registerAllTransformations } from '../core/transformations';

// Ensure all are registered
registerAllTransformations();

const CATEGORIES = [
  {
    title: 'Geometry & Crop',
    ids: ['resize', 'crop', 'smartCrop', 'cropToFace', 'flip', 'rotate', 'roundCorners', 'border', 'canvasPadding', 'zoom']
  },
  {
    title: 'Filters & Adjustments',
    ids: ['grayscale', 'sepia', 'brightness', 'blur', 'noise', 'sharpen', 'vignette', 'pixelate', 'duotone', 'posterize', 'edgeDetection']
  },
  {
    title: 'Color Correction',
    ids: ['autoLevels', 'tuning', 'opacity']
  },
  {
    title: 'Text & Watermark',
    ids: ['caption', 'watermark', 'advancedText']
  },
  {
    title: 'AI & Smart Features',
    ids: ['facePrivacy', 'smartRedaction', 'backgroundRemoval']
  },
  {
    title: 'Creative Effects',
    ids: ['textFill', 'textCutout', 'shapeOverlay', 'qrCodeStamp', 'mapSideBySide']
  },
  {
    title: 'Metadata',
    ids: ['stripMetadata', 'geocodeLocation']
  },
  {
    title: 'Workflow & Output',
    ids: ['exportStep', 'saveState', 'loadState', 'outputFolder', 'outputVideo', 'outputGif', 'outputContactSheet']
  }
];

export const HelpPage: React.FC = () => {
  return (
    <div className="help-page">
      <div className="help-container">
        <header className="help-header">
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
          <div className="header-content">
            <HelpCircle size={48} className="header-icon" />
            <div>
              <h1>Help Center</h1>
              <p>Documentation for all available transformations</p>
            </div>
          </div>
        </header>

        <div className="help-content">
          <aside className="help-sidebar">
            <nav>
              {CATEGORIES.map(cat => (
                <a key={cat.title} href={`#${cat.title.replace(/\s+/g, '-').toLowerCase()}`}>
                  {cat.title}
                </a>
              ))}
            </nav>
          </aside>

          <main className="transformations-list">
            {CATEGORIES.map(cat => (
              <section key={cat.title} id={cat.title.replace(/\s+/g, '-').toLowerCase()} className="category-section">
                <h2>{cat.title}</h2>
                <div className="cards-grid">
                  {cat.ids.map(id => {
                    const def = transformationRegistry.get(id);
                    if (!def) return null;
                    return (
                      <Link key={id} to={`/help/${id}`} className="trans-card">
                        <div className="card-header">
                          <h3>{def.name}</h3>
                          <ArrowLeft className="card-arrow" size={16} />
                        </div>
                        <p>{def.description}</p>
                        <span className="learn-more">Learn more &rarr;</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>

      <style>{`
        .help-page {
          background: #0f172a;
          min-height: 100vh;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .help-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .help-header {
          margin-bottom: 4rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .header-icon {
          color: #38bdf8;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #fff;
        }

        h1 {
          font-size: 2.5rem;
          color: #fff;
          margin: 0;
        }

        .help-header p {
          color: #94a3b8;
          margin: 0.5rem 0 0;
          font-size: 1.1rem;
        }

        .help-content {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 4rem;
        }

        .help-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .help-sidebar nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .help-sidebar a {
          color: #94a3b8;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .help-sidebar a:hover {
          color: #fff;
          background: rgba(56, 189, 248, 0.1);
        }

        .category-section {
          margin-bottom: 4rem;
          scroll-margin-top: 2rem;
        }

        .category-section h2 {
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .trans-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.2s;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .trans-card:hover {
          border-color: rgba(56, 189, 248, 0.5);
          transform: translateY(-2px);
          background: rgba(30, 41, 59, 0.8);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .card-arrow {
          transform: rotate(180deg);
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          color: #38bdf8;
        }

        .trans-card:hover .card-arrow {
          opacity: 1;
          transform: rotate(180deg) translateX(-4px);
        }

        .trans-card h3 {
          color: #38bdf8;
          margin: 0;
          font-size: 1.25rem;
        }

        .trans-card p {
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .learn-more {
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .trans-card:hover .learn-more {
          color: #fff;
        }
      `}</style>
    </div>
  );
};
