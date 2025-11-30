import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage';
import { EditorPage } from './pages/EditorPage';
import { HelpPage } from './pages/HelpPage';
import { TransformationHelpPage } from './pages/TransformationHelpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { ViewerPage } from './pages/ViewerPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:id" element={<TransformationHelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiePolicyPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;