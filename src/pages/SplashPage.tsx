import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Layers, Shield, Zap, Image as ImageIcon, Download } from 'lucide-react';

export const SplashPage: React.FC = () => {
  return (
    <div className="splash-container">
      <nav className="splash-nav">
        <div className="logo">
          <Wand2 className="logo-icon" />
          <span>ImgChef</span>
        </div>
        <div className="nav-links">
          <Link to="/help">Help</Link>
          <Link to="/viewer">Viewer</Link>
          <Link to="/editor">Editor</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Batch Image Processing <br />
            <span className="text-gradient">Reimagined</span>
          </h1>
          <p className="hero-subtitle">
            Process thousands of images directly in your browser.
            No uploads, no waiting, complete privacy.
          </p>
          <Link to="/editor" className="cta-button">
            Start Editing <Zap size={20} />
          </Link>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <Shield className="feature-icon" />
            <h3>Privacy First</h3>
            <p>Your photos never leave your device. All processing happens locally in your browser.</p>
          </div>
          <div className="feature-card">
            <Layers className="feature-icon" />
            <h3>Smart Workflows</h3>
            <p>Chain transformations together. Resize, crop, filter, and watermark in one go.</p>
          </div>
          <div className="feature-card">
            <ImageIcon className="feature-icon" />
            <h3>AI Powered</h3>
            <p>Smart cropping, background removal, and face detection built-in.</p>
          </div>
          <div className="feature-card">
            <Download className="feature-icon" />
            <h3>Bulk Export</h3>
            <p>Convert formats, rename files, and organize into folders automatically.</p>
          </div>
        </div>
      </main>

      <footer className="splash-footer">
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/cookies">Cookie Policy</Link>
          <Link to="/help">Help Center</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} BatchImg. All rights reserved.</p>
      </footer>

      <style>{`
        .splash-container {
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .splash-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 4rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #38bdf8;
        }

        .nav-links a {
          color: #94a3b8;
          text-decoration: none;
          margin-left: 2rem;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #fff;
        }

        .hero-section {
          padding: 6rem 2rem;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }

        .text-gradient {
          background: linear-gradient(to right, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #38bdf8;
          color: #0f172a;
          padding: 1rem 2.5rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 1.125rem;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(56, 189, 248, 0.4);
          background: #7dd3fc;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 6rem;
          text-align: left;
        }

        .feature-card {
          background: rgba(30, 41, 59, 0.5);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.1);
          transition: border-color 0.2s;
        }

        .feature-card:hover {
          border-color: rgba(56, 189, 248, 0.3);
        }

        .feature-icon {
          color: #38bdf8;
          width: 2rem;
          height: 2rem;
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.75rem;
          color: #f1f5f9;
        }

        .feature-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        .splash-footer {
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          padding: 3rem 2rem;
          text-align: center;
          margin-top: 4rem;
          color: #64748b;
        }

        .footer-links {
          margin-bottom: 1.5rem;
        }

        .footer-links a {
          color: #64748b;
          text-decoration: none;
          margin: 0 1rem;
          font-size: 0.875rem;
        }

        .footer-links a:hover {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};
