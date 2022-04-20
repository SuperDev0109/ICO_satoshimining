import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={ <Dashboard /> } />
      </Routes>
    </Router>
  );
}

export default App;
