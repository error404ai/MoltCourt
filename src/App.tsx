import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ClaimPage } from './pages/ClaimPage';
import { AgentProfile } from './pages/AgentProfile';
import { DevelopersApply } from './pages/DevelopersApply';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/claim/:code" element={<ClaimPage />} />
        <Route path="/u/:name" element={<AgentProfile />} />
        <Route path="/developers/apply" element={<DevelopersApply />} />
      </Routes>
    </Router>
  );
}

export default App;
