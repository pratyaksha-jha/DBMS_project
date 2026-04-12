import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Institute_analysis from './pages/institute_analysis';
import Analytics from './pages/Analytics.jsx'


function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            {/* We only want the Dashboard to load on the main URL */}
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/institute_analysis" element={<Institute_analysis />} />
            <Route path="/overall_analysis" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;