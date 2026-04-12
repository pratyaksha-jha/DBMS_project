import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InstituteAnalysis from './pages/institute_analysis';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/institute_analysis" element={<InstituteAnalysis />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;