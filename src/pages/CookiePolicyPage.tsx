import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const CookiePolicyPage: React.FC = () => {
    return (
        <div className="policy-page">
            <div className="policy-container">
                <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Home</Link>
                <h1>Cookie Policy</h1>
                <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2>1. What are cookies?</h2>
                    <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
                </section>

                <section>
                    <h2>2. How we use cookies</h2>
                    <p>BatchImg uses minimal cookies/local storage primarily for:</p>
                    <ul>
                        <li><strong>Essential functionality:</strong> Saving your preferences and custom recipes locally.</li>
                        <li><strong>Performance:</strong> Caching application assets to make the tool load faster.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. No Third-Party Tracking</h2>
                    <p>We do not use cookies for advertising or third-party tracking. Your usage data remains private.</p>
                </section>

                <section>
                    <h2>4. Managing Cookies</h2>
                    <p>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</p>
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
        ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          color: #cbd5e1;
          line-height: 1.7;
        }
        li {
          margin-bottom: 0.5rem;
        }
        strong {
          color: #fff;
        }
      `}</style>
        </div>
    );
};
