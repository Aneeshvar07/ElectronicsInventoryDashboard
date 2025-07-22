import React, { useContext, useState } from 'react';
import Sidebar from './sidebar';
import { InventoryContext } from './inventoryContext';
import Logo from '../assets/Logo3.jpg';
import { useNavigate } from 'react-router-dom';

// Navbar component (copied from dashboard.jsx for consistency)
const Navbar = ({ onMenuClick }) => (
  <nav className="fixed top-0 left-0 w-full h-14 bg-[#D8D2C2] text-[#4A4947] shadow z-30 flex items-center px-6 justify-between font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
    <div className="flex items-center gap-3">
      <button className="md:hidden p-2" onClick={onMenuClick}>
        <svg width="24" height="24" fill="none" stroke="#B17457" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
      </button>
      <img src={Logo} alt="Logo" className="h-13 w-45 mr-2 rounded" />
      <span className="font-bold text-xl tracking-tight">Inventory Dashboard</span>
    </div>
    <div className="flex items-center gap-4 relative">
      <div className="w-8 h-8 bg-[#B17457] rounded-full" />
    </div>
  </nav>
);

const EmptyDashboard = () => {
  const { categories } = useContext(InventoryContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAF7F0] min-h-screen font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14 min-h-screen" style={{gap: 20}}>
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onOpenCategoryModal={() => setCategoryModalOpen(true)}
          />
        </div>
        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-30 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute top-0 left-0 w-[280px] h-full">
              <Sidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onOpenCategoryModal={() => setCategoryModalOpen(true)}
              />
            </div>
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-[#B17457] mb-4">Welcome to the Inventory Dashboard</h1>
          <p className="text-lg text-[#4A4947] mb-8">Select a section to get started.</p>
          <div className="flex flex-col md:flex-row gap-6 mt-4">
            <button
              onClick={() => navigate('/parts')}
              className="bg-[#B17457] hover:bg-[#4A4947] text-white text-xl font-semibold px-10 py-6 rounded-2xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#B17457]"
            >
              Electronic Parts
            </button>
            <button
              onClick={() => navigate('/fasteners')}
              className="bg-[#4A4947] hover:bg-[#B17457] text-white text-xl font-semibold px-10 py-6 rounded-2xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A4947]"
            >
              Fasteners
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmptyDashboard; 