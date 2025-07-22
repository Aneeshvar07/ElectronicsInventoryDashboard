import React from 'react';
import Dashboard, { FastenersDashboardWrapper } from './components/dashboard';
import { InventoryProvider } from './components/inventoryContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmptyDashboard from './components/emptyDashboard';
import Login from './components/login';

const App = () => (
  <InventoryProvider>
    <Router>
      <Routes>
        <Route path="/" element={<EmptyDashboard />} />
        <Route path="/parts" element={<Dashboard type="parts" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/fasteners" element={<Dashboard type="fasteners" />} />
      </Routes>
    </Router>
  </InventoryProvider>
);

export default App;
