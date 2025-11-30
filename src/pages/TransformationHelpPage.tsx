import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Info, Sliders, Lightbulb } from 'lucide-react';
import { transformationRegistry } from '../core/Registry';
import { getHelpContent } from '../data/help_content';

export const TransformationHelpPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) return <Navigate to="/help" />;

    const def = transformationRegistry.get(id);
    const content = getHelpContent(id);

    if (!def) {
        return (
            <div className="help-detail-page">
                <div className="container">
                    <h1>Transformation Not Found</h1>
                    <Link to="/help" className="back-link">Back to Help Center</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="help-detail-page">
            <div className="container">
                <Link to="/help" className="back-link">
                    <ArrowLeft size={16} /> Back to Help Center
                </Link>

                <header className="detail-header">
                    <h1>{content?.title || def.name}</h1>
                    <p className="subtitle">{content?.shortDescription || def.description}</p>
                </header>

                <div className="detail-content">
                    <section className="main-info">
                        <h2><Info size={20} /> What it does</h2>
                        <p>{content?.fullDescription || def.description}</p>

                        {content?.usage && (
                            <div className="usage-block">
                                <h3>When to use</h3>
                                <p>{content.usage}</p>
                            </div>
                        )}
                    </section>

                    <section className="controls-info">
                        <h2><Sliders size={20} /> Controls & Parameters</h2>
                        <div className="params-grid">
                            {def.params.map(param => {
                                const paramHelp = content?.controls.find(c => c.title.toLowerCase() === param.label.toLowerCase() || c.title.toLowerCase() === param.name.toLowerCase());

                                return (
                                    <div key={param.name} className="param-card">
                                        <div className="param-header">
                                            <h3>{param.label}</h3>
                                            <span className="badge">{param.type}</span>
                                        </div>
                                        <p>{paramHelp?.content || `Control the ${param.label.toLowerCase()} of the transformation.`}</p>
                                        {param.defaultValue !== undefined && (
                                            <div className="default-value">Default: {String(param.defaultValue)}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {content?.tips && content.tips.length > 0 && (
                        <section className="tips-section">
                            <h2><Lightbulb size={20} /> Pro Tips</h2>
                            <ul>
                                {content.tips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>

            <style>{`
        .help-detail-page {
          background: #0f172a;
          min-height: 100vh;
          color: #e2e8f0;
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 2rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #38bdf8;
        }

        .detail-header {
          margin-bottom: 3rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          padding-bottom: 2rem;
        }

        .detail-header h1 {
          font-size: 3rem;
          color: #fff;
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 700px;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        section h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 1.5rem;
        }

        section h2 svg {
          color: #38bdf8;
        }

        .main-info p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #cbd5e1;
          max-width: 800px;
        }

        .usage-block {
          background: rgba(56, 189, 248, 0.1);
          border-left: 4px solid #38bdf8;
          padding: 1.5rem;
          margin-top: 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .usage-block h3 {
          color: #38bdf8;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .usage-block p {
          margin: 0;
          font-size: 1rem;
        }

        .params-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .param-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .param-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .param-header h3 {
          color: #e2e8f0;
          font-size: 1.1rem;
          margin: 0;
        }

        .badge {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-family: monospace;
          text-transform: uppercase;
        }

        .param-card p {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .default-value {
          font-size: 0.875rem;
          color: #64748b;
          font-family: monospace;
        }

        .tips-section ul {
          list-style: none;
          padding: 0;
        }

        .tips-section li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .tips-section li::before {
          content: "•";
          color: #38bdf8;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
      `}</style>
        </div>
    );
};
