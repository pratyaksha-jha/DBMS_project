import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Institute_analysis from './pages/institute_analysis';

function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            {/* We only want the Dashboard to load on the main URL */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/institute_analysis" element={<Institute_analysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;