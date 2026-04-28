import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import About from './pages/About.jsx';
import Institute_analysis from './pages/institute_analysis';
import Analytics from './pages/Analytics.jsx';
import IITGAnalysis from './pages/IITG.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/"                    element={<Dashboard />} />
            <Route path="/about"               element={<About />} />
            <Route path="/institute_analysis"  element={<Institute_analysis />} />
            <Route path="/overall_analysis"    element={<Analytics />} />
            <Route path="/iitg"                element={<IITGAnalysis />} />
            <Route path="/insights/institute"  element={<Navigate to="/institute_analysis" replace />} />
            <Route path="/insights/overall"    element={<Navigate to="/overall_analysis"   replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
