import React, { useContext, useState, useEffect } from 'react';
import { InventoryContext } from './inventoryContext';
import { Plus, Search, Eye, EyeOff, Menu as MenuIcon, MoreVertical } from 'lucide-react';
import AddPartForm from './addPartForm';
import EditPartForm from './editPartForm';
import AddCategoryForm from './addCategoryForm';
import Sidebar from './sidebar';
import Modal from './modal';
import CategoryTree from './categoryTree';
import axios from 'axios';
import Logo from '../assets/Logo3.jpg';
import ImportParts from './importParts';
import FastenersDashboard from './fastenersDashboard';
import { compareWithUnitAware } from './utils';
// Navbar component (move here for access to state)
const Navbar = ({ onMenuClick }) => (
  <nav className="fixed top-0 left-0 w-full h-14 bg-[#D8D2C2] text-[#4A4947] shadow z-30 flex items-center px-6 justify-between font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
    <div className="flex items-center gap-3">
      <button className="md:hidden p-2" onClick={onMenuClick}>
        <MenuIcon size={24} color="#B17457" />
      </button>
      <img src={Logo} alt="Logo" className="h-13 w-45 mr-2 rounded" />
      <span className="font-bold text-xl tracking-tight">Inventory Dashboard</span>
    </div>
    <div className="flex items-center gap-4 relative">
      {/* Placeholder for user/profile/settings */}
      <div className="w-8 h-8 bg-[#B17457] rounded-full" />
    </div>
  </nav>
);

// // Sidebar component
// const Sidebar = ({ categories, selectedCategoryId, setSelectedCategoryId, sidebarOpen, setSidebarOpen }) => (
//   <aside className={`h-[calc(100vh-3.5rem)] w-[280px] bg-[#D8D2C2] text-[#4A4947] z-40 flex flex-col shadow-lg rounded-r-2xl border-r border-[#4A4947] transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
//     <div className="h-14 flex items-center px-6 font-bold text-lg border-b border-[#4A4947] select-none">Inventory</div>
//     <div className="flex-1 overflow-y-auto p-4">
//       <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Menu size={16} color="#B17457" />Filter by Category</h2>
//       <div className="bg-[#FAF7F0] rounded-lg p-2 max-h-[400px] overflow-y-auto">
//         <CategoryTree
//           categories={categories}
//           selectedId={selectedCategoryId}
//           onSelect={setSelectedCategoryId}
//         />
//         {selectedCategoryId && (
//           <button
//             className="text-xs mt-3 text-[#B17457] underline hover:text-[#4A4947]"
//             onClick={() => setSelectedCategoryId(null)}
//           >
//             Clear Filter
//           </button>
//         )}
//       </div>
//     </div>
//   </aside>
// );

const Dashboard = ({ type }) => {
  if (type === 'fasteners') {
    return <FastenersDashboard />;
  }

  const { parts, categories, getCategoryPath, deletePart } = useContext(InventoryContext);

  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showEditPartForm, setShowEditPartForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    const saved = localStorage.getItem('selectedCategoryId');
    return saved ? JSON.parse(saved) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [selectedParts, setSelectedParts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [actionMenuOpen, setActionMenuOpen] = useState(null); // row id or null

  useEffect(() => {
    if (selectedCategoryId !== null) {
      localStorage.setItem('selectedCategoryId', JSON.stringify(selectedCategoryId));
    } else {
      localStorage.removeItem('selectedCategoryId');
    }
  }, [selectedCategoryId]);

  // Handler to refresh categories (assume you have a fetchCategories function or similar)
  // If not, you may need to reload the page or refetch context
  const { fetchCategories, editCategory } = useContext(InventoryContext);

  // Edit handler
  const handleEditCategory = async (category) => {
    const newName = window.prompt('Rename category:', category.name);
    if (!newName || newName === category.name) return;
    setEditCategoryLoading(true);
    try {
      await editCategory(category.id, newName);
    } catch (err) {
      alert(err.message || 'Failed to rename category.');
    } finally {
      setEditCategoryLoading(false);
    }
  };

  const { deleteCategory } = useContext(InventoryContext);

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`)) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteCategory(category.id);
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    partNumber: true,
    package: true,
    category: true,
    description: true,
    inStock: true,
    minimumStock: true,
    location: true,
    voltage: true,
    comments: true
  });

  const handleEditPart = (part) => {
    setEditingPart(part);
    setShowEditPartForm(true);
  };

  const toggleColumnVisibility = (column) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column]
    });
  };

  // Get all descendant category IDs from a selected category
  const getAllDescendantCategoryIds = (catId, nodes = categories) => {
    let ids = [];
    for (const node of nodes) {
      if (node.id === catId) {
        const collect = (c) => {
          let res = [c.id];
          c.children.forEach(child => res.push(...collect(child)));
          return res;
        };
        return collect(node);
      }
      if (node.children.length) {
        const found = getAllDescendantCategoryIds(catId, node.children);
        if (found.length) return found;
      }
    }
    return [];
  };

  const matchesCategory = (partCatId) => {
    if (!selectedCategoryId) return true;
    const ids = getAllDescendantCategoryIds(selectedCategoryId);
    return ids.includes(partCatId);
  };

  const filteredParts = parts.filter((part) => {
    // If no search term, include all
    if (!searchTerm) return matchesCategory(part.categoryId);
    // Check all visible columns
    const searchFields = Object.keys(visibleColumns).filter(col => visibleColumns[col]);
    const matches = searchFields.some(col => {
      const value = part[col];
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
    return matches && matchesCategory(part.categoryId);
  });

  function parseValue(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const lower = val.toLowerCase().replace(/,/g, '').trim();
    // Ohms
    if (lower.endsWith('m ohm')) return parseFloat(lower) * 1e6;
    if (lower.endsWith('k ohm')) return parseFloat(lower) * 1e3;
    if (lower.endsWith('ohm')) return parseFloat(lower);
    // Farads
    if (lower.endsWith('pf')) return parseFloat(lower) * 1e-12;
    if (lower.endsWith('nf')) return parseFloat(lower) * 1e-9;
    if (lower.endsWith('uf')) return parseFloat(lower) * 1e-6;
    if (lower.endsWith('mf')) return parseFloat(lower) * 1e-3;
    if (lower.endsWith('f')) return parseFloat(lower);
    // Default: try to parse as float
    return parseFloat(lower) || 0;
  }

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const sortedParts = React.useMemo(() => {
    if (!sortBy) return filteredParts;
    const result = [...filteredParts].sort((a, b) => {
      const cmp = compareWithUnitAware(a, b, sortBy);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [filteredParts, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedParts.length / itemsPerPage);

  // Pagination logic
  const paginatedParts = sortedParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when searchTerm changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const [categorySearch, setCategorySearch] = useState('');

  function filterCategories(categories, query) {
    if (!query) return categories;
    const lowerQuery = query.toLowerCase();
    return categories
      .map(cat => {
        const children = filterCategories(cat.children || [], query);
        if (
          cat.name.toLowerCase().includes(lowerQuery) ||
          children.length > 0
        ) {
          return { ...cat, children };
        }
        return null;
      })
      .filter(Boolean);
  }

  return (
    <div className="bg-[#FAF7F0] min-h-screen font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
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
        {/* Category Management Modal */}
        <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Category Management">
          <div className="bg-[#FAF7F0] rounded-lg p-0">
            <div className="p-4 relative">
              <input
                type="text"
                placeholder="Search category..."
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg pr-10"
              />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label="Clear search"
                >
                  &#10005;
                </button>
              )}
            </div>
            <CategoryTree
              categories={filterCategories(categories, categorySearch)}
              selectedId={null}
              onSelect={() => {}}
              showActions={true}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
            {(editCategoryLoading || deleteCategoryLoading) && (
              <div className="mt-4 text-sm text-[#B17457]">Processing...</div>
            )}
          </div>
        </Modal>
          {/* Main Content */}
        <main className="flex-1 p-4 md:p-6" style={{padding: 16}}>
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#FAF7F0] text-[#4A4947] rounded-2xl shadow-lg p-6 md:p-8" style={{padding: 16}}>
            {/* Header */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#4A4947] mb-1">Electronics Inventory</h1>
                <p className="text-[#B17457] text-sm md:text-base font-medium">Manage your electronic components efficiently</p>
            </div>
              {/* Controls */}
              <div className="flex flex-wrap gap-3 md:gap-4 items-center mb-4" style={{marginBottom: 16}}>
                <div className="relative inline-block text-left">
              <button
                    onClick={() => setColumnsDropdownOpen((open) => !open)}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#B17457] text-white hover:bg-[#4A4947] focus:outline-none"
              >
                    <MenuIcon size={18} />
                    <span className="hidden md:inline">Columns</span>
              </button>
                  {columnsDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
                      {Object.entries(visibleColumns).map(([col, show]) => (
              <button
                          key={col}
                          onClick={() => toggleColumnVisibility(col)}
                          className={`flex items-center w-full px-4 py-2 transition-colors group hover:bg-[#F5EDE6] ${!show ? 'bg-[#E5E5E5]' : ''}`}
                        >
                          {show
                            ? <Eye size={18} className="mr-2 text-[#B17457] group-hover:text-[#4A4947]" />
                            : <EyeOff size={18} className="mr-2 text-[#B17457] group-hover:text-[#4A4947]" />
                          }
                          <span className="text-[#4A4947] group-hover:text-[#4A4947]">
                            {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                          </span>
              </button>
                      ))}
                    </div>
                  )}
            </div>
                <div className="relative w-full max-w-xs md:max-w-md">
                  <Search className="absolute left-3 top-3" size={18} color="#B17457" />
                <input
                  type="text"
                  placeholder="Search parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-[#4A4947] rounded-lg focus:ring-2 focus:ring-[#B17457] text-sm md:text-base bg-[#FAF7F0] text-[#4A4947] placeholder-[#D8D2C2]"
                />
              </div>
              </div>
            {/* Breadcrumb Display */}
            {selectedCategoryId && (
                <div className="text-xs md:text-sm text-[#B17457] mb-2" style={{marginBottom: 8}}>
                Showing parts under: <strong>{getCategoryPath(selectedCategoryId).join(' > ')}</strong>
              </div>
            )}
              {/* Import/Export/Delete buttons above the table, right-aligned and outside the table container */}
              <div className="flex justify-end items-center mb-2 gap-2">
                <ImportParts currentCategoryId={selectedCategoryId} />
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md text-sm transition-colors disabled:opacity-50"
                  disabled={selectedParts.length === 0}
                  onClick={() => {
                    if (
                      selectedParts.length > 0 &&
                      window.confirm(`Are you sure you want to delete ${selectedParts.length} selected part(s)? This cannot be undone.`)
                    ) {
                      selectedParts.forEach(id => deletePart(id));
                      setSelectedParts([]);
                    }
                  }}
                >
                  Delete Selected
                </button>
                <button
                  className="bg-[#B17457] hover:bg-[#4A4947] text-white px-4 py-2 rounded-lg font-semibold shadow-md text-sm transition-colors"
                  onClick={() => {
                    const dataToExport = selectedParts.length > 0
                      ? parts.filter(p => selectedParts.includes(p.id))
                      : parts;
                    const csv = [
                      Object.keys(dataToExport[0] || {}).join(","),
                      ...dataToExport.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
                    ].join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'parts_export.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export
                </button>
              </div>
            {/* Parts Table */}
              <div className="overflow-x-auto bg-[#FAF7F0] rounded-xl shadow border border-[#4A4947]" style={{marginTop: 12}}>
                <table className="min-w-full divide-y divide-[#4A4947]" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                  <thead className="bg-[#D8D2C2]">
                    <tr>
                      <th className="px-2 md:px-4 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedParts.length === filteredParts.length && filteredParts.length > 0}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedParts(filteredParts.map(p => p.id));
                            } else {
                              setSelectedParts([]);
                            }
                          }}
                        />
                      </th>
                      {visibleColumns.name && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('name')}
                        >
                          Name{sortBy === 'name' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.partNumber && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('partNumber')}
                        >
                          Part Number{sortBy === 'partNumber' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.package && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('package')}
                        >
                          Package{sortBy === 'package' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.category && (
                        <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">Category</th>
                      )}
                      {visibleColumns.description && (
                        <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">Description</th>
                      )}
                      {visibleColumns.inStock && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('inStock')}
                        >
                          In Stock{sortBy === 'inStock' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.minimumStock && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('minimumStock')}
                        >
                          Min Stock{sortBy === 'minimumStock' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.location && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('location')}
                        >
                          Location{sortBy === 'location' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.voltage && (
                        <th
                          className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947] cursor-pointer select-none"
                          onClick={() => handleSort('voltage')}
                        >
                          Voltage{sortBy === 'voltage' ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                        </th>
                      )}
                      {visibleColumns.comments && (
                        <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">Comments</th>
                      )}
                      <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FAF7F0] divide-y divide-[#4A4947]">
                    {paginatedParts.map((part) => (
                      <tr key={part.id} className={part.inStock <= part.minimumStock ? 'bg-[#B17457]/20' : 'hover:bg-[#B17457]/10 transition-colors'}>
                        <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">
                          <input
                            type="checkbox"
                            checked={selectedParts.includes(part.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedParts(prev => [...prev, part.id]);
                              } else {
                                setSelectedParts(prev => prev.filter(id => id !== part.id));
                              }
                            }}
                          />
                        </td>
                        {visibleColumns.name && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.name}</td>
                        )}
                        {visibleColumns.partNumber && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.partNumber}</td>
                        )}
                        {visibleColumns.package && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.package}</td>
                        )}
                        {visibleColumns.category && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">
                            {getCategoryPath(part.categoryId).slice(-1)[0]}
                          </td>
                        )}
                        {visibleColumns.description && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.description}</td>
                        )}
                        {visibleColumns.inStock && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.inStock}</td>
                        )}
                        {visibleColumns.minimumStock && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.minimumStock}</td>
                        )}
                        {visibleColumns.location && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.location}</td>
                        )}
                        {visibleColumns.voltage && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.voltage}</td>
                        )}
                        {visibleColumns.comments && (
                          <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">{part.comments}</td>
                        )}
                        <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947] space-x-2 md:space-x-4 relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === part.id ? null : part.id)}
                            className="p-1 rounded hover:bg-[#E5E5E5]"
                            aria-label="More actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {actionMenuOpen === part.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-20">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F5EDE6]"
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  handleEditPart(part);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F5EDE6] text-red-600"
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  if (window.confirm('Are you sure you want to delete this part?')) {
                                    deletePart(part.id);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  {filteredParts.length === 0 && (
                    <tr>
                        <td colSpan="8" className="px-2 md:px-4 py-2 text-center text-[#D8D2C2]">
                        No parts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
              {/* Pagination controls below the table */}
              <div className="flex justify-center mt-4 gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 rounded bg-[#B17457] text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2">{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 rounded bg-[#B17457] text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            {/* Modals */}
            <AddPartForm isOpen={showAddPartForm} onClose={() => setShowAddPartForm(false)} />
            <AddCategoryForm isOpen={showAddCategoryForm} onClose={() => setShowAddCategoryForm(false)} />
            <EditPartForm
              isOpen={showEditPartForm}
              onClose={() => setShowEditPartForm(false)}
              part={editingPart}
            />
            </div>
          </div>
        </main>
        {/* Add FAB at bottom right of the screen with sidebar color theme */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
          {fabOpen && (
            <div className="mb-2 w-48 bg-[#181C23] border border-[#23272F] rounded shadow-lg">
              <button
                className="w-full px-4 py-2 text-left transition-colors group hover:bg-[#23272F] hover:text-[#B17457] text-[#F3F4F6]"
                onClick={() => { setShowAddPartForm(true); setFabOpen(false); }}
              >
                + Add New Part
              </button>
              <button
                className="w-full px-4 py-2 text-left transition-colors group hover:bg-[#23272F] hover:text-[#B17457] text-[#F3F4F6]"
                onClick={() => { setShowAddCategoryForm(true); setFabOpen(false); }}
              >
                + Add Category
              </button>
            </div>
          )}
          <div className="flex items-center mb-2">
            <span className="bg-[#B17457] text-white px-3 py-1 rounded-l-full shadow text-sm">Add here</span>
            <button
              className="bg-[#181C23] group hover:bg-[#23272F] text-[#F3F4F6] rounded-full p-4 shadow-lg transition-colors ml-2 flex items-center justify-center"
              onClick={() => setFabOpen((open) => !open)}
              aria-label="Add"
            >
              <Plus size={28} className="transition-colors text-[#F3F4F6] group-hover:text-[#B17457]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
export const FastenersDashboardWrapper = () => <Dashboard type="fasteners" />;
