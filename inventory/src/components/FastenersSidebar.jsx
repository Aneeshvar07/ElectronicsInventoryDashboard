import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, List, Folder, Menu, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Settings } from 'lucide-react';
import FastenersCategoryTree from './FastenersCategoryTree';

const FastenersSidebar = ({ categories, selectedCategoryId, setSelectedCategoryId, sidebarOpen, setSidebarOpen, onOpenCategoryModal }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(true); // default expanded
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: <Home size={20} />, onClick: () => navigate('/') },
    { label: 'Fasteners', icon: <List size={20} />, onClick: () => navigate('/fasteners') },
    { label: 'Category', icon: <Folder size={20} />, onClick: onOpenCategoryModal },
    { label: 'Filter', icon: <Menu size={20} />, collapsible: true },
  ];

  return (
    <aside className={`h-[calc(100vh-3.5rem)] ${collapsed ? 'w-20' : 'w-85'} bg-[#181C23] text-[#F3F4F6] z-40 flex flex-col shadow-lg rounded-r-2xl border-r border-[#23272F] transition-all duration-200`}>
      {/* User Profile */}
      <div className="h-16 flex items-center px-4 gap-3 border-b border-[#23272F]">
        <div className="w-10 h-10 rounded-full bg-[#B17457] flex items-center justify-center text-lg font-bold">A</div>
        {!collapsed && (
          <div>
            <div className="font-semibold">Amélie Laurent</div>
            <div className="text-xs text-[#B17457]">amelie@untitledui.com</div>
          </div>
        )}
        <button className="ml-auto p-1" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      {/* Menu Items */}
      <nav className="flex-1 py-4 flex flex-col gap-1">
        {menuItems.map((item, idx) => (
          <div key={item.label}>
            <button
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${collapsed ? 'justify-center' : ''} hover:bg-[#23272F]`}
              onClick={item.onClick}
            >
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.label === 'Filter' ? 'Filter by Category' : item.label}</span>}
              {item.collapsible && !collapsed && (categoryOpen ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />)}
            </button>
            {/* Collapsible Filter by Category */}
            {item.label === 'Filter' && categoryOpen && !collapsed && (
              <div className="bg-[#23272F] rounded-lg p-2 max-h-[600px] overflow-y-auto ml-4 mr-2">
                <FastenersCategoryTree
                  categories={categories}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
                {selectedCategoryId && (
                  <button
                    className="text-xs mt-3 text-[#B17457] underline hover:text-[#F3F4F6]"
                    onClick={() => setSelectedCategoryId(null)}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* Settings at bottom */}
      <div className="border-t border-[#23272F] p-4 flex items-center gap-3 hover:bg-[#23272F] transition-colors cursor-pointer">
        <Settings size={20} />
        {!collapsed && <span className="text-sm font-medium">Settings</span>}
      </div>
    </aside>
  );
};

export default FastenersSidebar; 