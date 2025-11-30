import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>Welcome to BatchImg. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                </section>

                <section>
                    <h2>2. Data Processing</h2>
                    <p><strong>BatchImg is a client-side application.</strong> This means that all image processing happens directly in your web browser. Your images are <strong>never</strong> uploaded to our servers or any third-party servers.</p>
                    <p>We do not collect, store, or transmit your images. They remain on your device at all times.</p>
                </section>

                <section>
                    <h2>3. Local Storage</h2>
                    <p>We use your browser's local storage to save your preferences and recipes (workflows). This data is stored locally on your device and is not synchronized with any server.</p>
                </section>

                <section>
                    <h2>4. Analytics</h2>
                    <p>We may use anonymous analytics to understand how our tool is used (e.g., which features are most popular). This data does not include any personal information or image data.</p>
                </section>

                <section>
                    <h2>5. Contact Us</h2>
                    <p>If you have any questions about this privacy policy, please contact us.</p>
                </section>
            </div>
            <style>{`
        .policy-page {
          background: #0f172a;
          min-height: 100vh;
          color: #e2e8f0;
          padding: 4rem 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .policy-container {
          max-width: 800px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #38bdf8;
          text-decoration: none;
          margin-bottom: 2rem;
          font-weight: 500;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .last-updated {
          color: #94a3b8;
          margin-bottom: 3rem;
        }
        section {
          margin-bottom: 2.5rem;
        }
        h2 {
          font-size: 1.5rem;
          color: #f1f5f9;
          margin-bottom: 1rem;
        }
        p {
          line-height: 1.7;
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        strong {
          color: #fff;
        }
      `}</style>
        </div>
    );
};
