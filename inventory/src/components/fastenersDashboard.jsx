import React, { useEffect, useState, useContext, useMemo } from 'react';
import AddFastenerForm from './addFastenersForm';
import AddCategoryForm from './addCategoryForm';
import EditFastenerForm from './editFastenerForm';
import { InventoryContext } from './inventoryContext';
import FastenersSidebar from './FastenersSidebar';
import Logo from '../assets/Logo3.jpg';
import ImportFasteners from './importFasteners';
import { Eye, EyeOff, Menu as MenuIcon, Plus } from 'lucide-react';
import Modal from './modal';
import FastenersCategoryTree from './FastenersCategoryTree';

const columnsList = [
  { key: 'name', label: 'Name' },
  { key: 'headShape', label: 'Head Shape' },
  { key: 'head', label: 'Head' },
  { key: 'diameter', label: 'Diameter' },
  { key: 'length', label: 'Length' },
  { key: 'washer', label: 'Washer?' },
  { key: 'material', label: 'Material' },
  { key: 'od', label: 'OD' },
  { key: 'id_dimension', label: 'ID' },
  { key: 'thickness', label: 'Thickness' },
  { key: 'plating', label: 'Plating' },
  { key: 'color', label: 'Color' },
  { key: 'description', label: 'Description' },
  { key: 'location', label: 'Location' },
  { key: 'inStock', label: 'In Stock' },
  { key: 'minimumStock', label: 'MinStock' },
  { key: 'categoryName', label: 'Category' },
];

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

const FastenersDashboard = () => {
  const [fasteners, setFasteners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFastener, setEditingFastener] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('fastenersVisibleColumns');
    if (saved) return JSON.parse(saved);
    const initial = {};
    columnsList.forEach(col => initial[col.key] = true);
    return initial;
  });
  const [selectedFasteners, setSelectedFasteners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { fasteners: contextFasteners, fastenerCategories, addFastenerCategory, editFastenerCategory, deleteFastenerCategory, flatFastenerCategories } = useContext(InventoryContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const columnsDropdownRef = React.useRef();
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Flatten category tree for quick lookup
  const categoryMap = useMemo(() => {
    const map = {};
    function traverse(categories) {
      categories.forEach(cat => {
        map[cat.id] = cat;
        if (cat.children && cat.children.length) {
          traverse(cat.children);
        }
      });
    }
    traverse(fastenerCategories);
    return map;
  }, [fastenerCategories]);

  // Recursively collect all descendant category IDs
  const getDescendantIds = (catId) => {
    const ids = [];
    function collect(id) {
      ids.push(id);
      const children = fastenerCategories.filter(c => c.parentId === id);
      children.forEach(child => collect(child.id));
    }
    if (catId) collect(catId);
    return ids;
  };

  // Filter fasteners by selected category and its descendants
  const filteredFasteners = useMemo(() => {
    if (!selectedCategoryId) return fasteners;
    const allowedIds = getDescendantIds(selectedCategoryId);
    return fasteners.filter(f => allowedIds.includes(f.categoryId));
  }, [fasteners, selectedCategoryId, fastenerCategories]);

  // Breadcrumb trail for selected category
  const getBreadcrumb = (catId) => {
    const trail = [];
    let current = categoryMap[catId];
    while (current) {
      trail.unshift(current);
      current = current.parentId ? categoryMap[current.parentId] : null;
    }
    return trail;
  };
  const breadcrumb = selectedCategoryId ? getBreadcrumb(selectedCategoryId) : [];

  // Close columns dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(event.target)) {
        setVisibleColumns(prev => ({ ...prev, _dropdown: false }));
      }
    }
    if (visibleColumns._dropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visibleColumns._dropdown]);

  // Persist visibleColumns to localStorage whenever it changes (except for _dropdown)
  useEffect(() => {
    const { _dropdown, ...toSave } = visibleColumns;
    localStorage.setItem('fastenersVisibleColumns', JSON.stringify(toSave));
  }, [visibleColumns]);

  // Fetch fasteners and categories
  const fetchFasteners = async () => {
    const res = await fetch('http://localhost:5000/api/fasteners');
    const data = await res.json();
    setFasteners(data);
  };
  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchFasteners();
    fetchCategories();
  }, []);

  // Helper: Find the Fasteners root category and all its descendants
  const findFastenersRoot = (cats) => cats.find(cat => cat.name.toLowerCase() === 'fasteners');
  const collectDescendants = (cat) => {
    if (!cat) return [];
    let all = [cat];
    if (cat.children && cat.children.length) {
      cat.children.forEach(child => {
        all = all.concat(collectDescendants(child));
      });
    }
    return all;
  };

  // Build nested tree from flat list
  const buildCategoryTree = (flatList) => {
    const map = new Map();
    const roots = [];
    flatList.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });
    flatList.forEach(cat => {
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) parent.children.push(map.get(cat.id));
      } else {
        roots.push(map.get(cat.id));
      }
    });
    return roots;
  };

  const categoryTree = buildCategoryTree(categories);
  const fastenersRoot = findFastenersRoot(categoryTree);
  const fastenerCategoriesFlat = collectDescendants(fastenersRoot);
  const fastenerCategoriesTree = fastenersRoot ? [fastenersRoot] : [];

  // Use only fastener categories for sidebar/tree
  const allCategories = fastenerCategoriesTree;

  // Map categoryId to category name for display (use getCategoryPath if available)
  const getCategoryName = (categoryId) => {
    if (!allCategories || allCategories.length === 0) return '';
    // Try to use getCategoryPath from InventoryContext if available
    if (typeof window.getCategoryPath === 'function') {
      const path = window.getCategoryPath(categoryId);
      return path && path.length ? path[path.length - 1] : '';
    }
    const cat = allCategories.find(c => c.id === categoryId);
    return cat ? cat.name : '';
  };

  // Add categoryName to each fastener for easier filtering/display
  const fastenersWithCategory = fasteners.map(f => ({
    ...f,
    categoryName: getCategoryName(f.categoryId)
  }));

  // Filter fasteners by selected category
  const matchesCategory = (fastenerCatId) => {
    if (!selectedCategoryId) return true;
    const ids = getDescendantIds(selectedCategoryId);
    return ids.includes(fastenerCatId);
  };

  // Search and filter
  const filteredFastenersForTable = fastenersWithCategory.filter(f => {
    if (!matchesCategory(f.categoryId)) return false;
    if (!searchTerm) return true;
    // Search all visible columns
    return columnsList.some(col => {
      if (!visibleColumns[col.key]) return false;
      const value = f[col.key];
      return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Pagination
  const totalPages = Math.ceil(filteredFastenersForTable.length / itemsPerPage);
  const paginatedFasteners = filteredFastenersForTable.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Column toggling
  const toggleColumnVisibility = (colKey) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Bulk delete
  const deleteSelected = async () => {
    if (selectedFasteners.length === 0) return;
    if (!window.confirm(`Delete ${selectedFasteners.length} selected fastener(s)?`)) return;
    for (const id of selectedFasteners) {
      await fetch(`http://localhost:5000/api/fasteners/${id}`, { method: 'DELETE' });
    }
    setSelectedFasteners([]);
    fetchFasteners();
  };

  // Single delete
  const deleteFastener = async (id) => {
    if (window.confirm('Delete this fastener?')) {
      await fetch(`http://localhost:5000/api/fasteners/${id}`, { method: 'DELETE' });
      fetchFasteners();
    }
  };

  // Import/Export logic (CSV)
  const handleExport = () => {
    const dataToExport = selectedFasteners.length > 0
      ? fastenersWithCategory.filter(f => selectedFasteners.includes(f.id))
      : fastenersWithCategory;
    if (dataToExport.length === 0) return;
    const csv = [
      columnsList.map(col => col.label).join(','),
      ...dataToExport.map(row => columnsList.map(col => '"' + (row[col.key] ?? '') + '"').join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fasteners_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to get category path for 'showing fasteners under'
  const getCategoryPath = (categoryId) => {
    const map = new Map(flatFastenerCategories.map(cat => [cat.id, cat]));
    const buildPath = (id) => {
      const cat = map.get(id);
      if (!cat) return [];
      return cat.parentId ? [...buildPath(cat.parentId), cat.name] : [cat.name];
    };
    return buildPath(categoryId);
  };

  // Edit handler for fastener categories
  const handleEditCategory = async (category) => {
    const newName = window.prompt('Rename category:', category.name);
    if (!newName || newName === category.name) return;
    setEditCategoryLoading(true);
    try {
      await editFastenerCategory(category.id, newName);
    } catch (err) {
      alert(err.message || 'Failed to rename category.');
    } finally {
      setEditCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`)) return;
    setDeleteCategoryLoading(true);
    try {
      await deleteFastenerCategory(category.id);
    } catch (err) {
      alert(err.message || 'Failed to delete category.');
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  // Table UI
  return (
    <div className="bg-[#FAF7F0] min-h-screen font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14 min-h-screen" style={{gap: 20}}>
        {/* Sidebar */}
        <div className="hidden md:block">
          <FastenersSidebar
            categories={fastenerCategories}
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
              <FastenersSidebar
                categories={fastenerCategories}
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
        <main className="flex-1 p-4 md:p-6" style={{padding: 16}}>
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#FAF7F0] text-[#4A4947] rounded-2xl shadow-lg p-6 md:p-8" style={{padding: 16}}>
              {/* Header */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#4A4947] mb-1">Fasteners Inventory</h1>
                <p className="text-[#B17457] text-sm md:text-base font-medium">Manage your fasteners efficiently</p>
              </div>
              {/* Breadcrumb */}
              <div className="text-sm text-[#B17457] mb-4">
                {breadcrumb.map((cat, idx) => (
                  <span key={cat.id}>
                    {idx > 0 && ' / '}
                    {cat.name}
                  </span>
                ))}
              </div>
              {/* Controls and Table (matching parts dashboard) */}
              <div className="flex flex-wrap gap-3 md:gap-4 items-center mb-4">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  + Add Fastener
                </button>
                <button
                  onClick={() => setShowAddCategoryForm(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  + Add Category
                </button>
                <ImportFasteners currentCategoryId={selectedCategoryId} />
                <button
                  onClick={deleteSelected}
                  className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                  disabled={selectedFasteners.length === 0}
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleExport}
                  className="bg-[#B17457] text-white px-4 py-2 rounded"
                >
                  Export
                </button>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() => setVisibleColumns(prev => ({ ...prev, _dropdown: !prev._dropdown }))}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-[#B17457] text-white hover:bg-[#4A4947] focus:outline-none"
                  >
                    <MenuIcon size={18} />
                    <span className="hidden md:inline">Columns</span>
                  </button>
                  {visibleColumns._dropdown && (
                    <div
                      ref={columnsDropdownRef}
                      className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-20"
                      style={{ maxHeight: '400px', overflowY: 'auto' }}
                    >
                      {columnsList.map(col => (
                        <button
                          key={col.key}
                          onClick={() => toggleColumnVisibility(col.key)}
                          className={`flex items-center w-full px-4 py-2 transition-colors group hover:bg-[#F5EDE6] ${!visibleColumns[col.key] ? 'bg-[#E5E5E5]' : ''}`}
                        >
                          {visibleColumns[col.key]
                            ? <Eye size={18} className="mr-2 text-[#B17457] group-hover:text-[#4A4947]" />
                            : <EyeOff size={18} className="mr-2 text-[#B17457] group-hover:text-[#4A4947]" />
                          }
                          <span className="text-[#4A4947] group-hover:text-[#4A4947]">
                            {col.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative w-full max-w-xs md:max-w-md">
                  <input
                    type="text"
                    placeholder="Search fasteners..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 md:py-3 border border-[#4A4947] rounded-lg focus:ring-2 focus:ring-[#B17457] text-sm md:text-base bg-[#FAF7F0] text-[#4A4947] placeholder-[#D8D2C2]"
                  />
                </div>
              </div>
              {/* Table and pagination (existing code) */}
              <div className="overflow-x-auto bg-[#FAF7F0] rounded-xl shadow border border-[#4A4947]" style={{marginTop: 12}}>
                <table className="min-w-full divide-y divide-[#4A4947]" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
                  <thead className="bg-[#D8D2C2]">
                    <tr>
                      <th className="px-2 md:px-4 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedFasteners.length === filteredFastenersForTable.length && filteredFastenersForTable.length > 0}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedFasteners(filteredFastenersForTable.map(f => f.id));
                            } else {
                              setSelectedFasteners([]);
                            }
                          }}
                        />
                      </th>
                      {columnsList.map(col => visibleColumns[col.key] && (
                        <th key={col.key} className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">{col.label}</th>
                      ))}
                      <th className="px-2 md:px-4 py-2 text-left text-xs md:text-sm font-bold text-[#4A4947]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#FAF7F0] divide-y divide-[#4A4947]">
                    {paginatedFasteners.map((f) => (
                      <tr key={f.id} className={f.inStock <= f.minimumStock ? 'bg-[#B17457]/20' : 'hover:bg-[#B17457]/10 transition-colors'}>
                        <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">
                          <input
                            type="checkbox"
                            checked={selectedFasteners.includes(f.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedFasteners(prev => [...prev, f.id]);
                              } else {
                                setSelectedFasteners(prev => prev.filter(id => id !== f.id));
                              }
                            }}
                          />
                        </td>
                        {columnsList.map(col => visibleColumns[col.key] && (
                          <td key={col.key} className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947]">
                            {col.key === 'categoryName'
                              ? (getCategoryPath(f.categoryId).slice(-1)[0] || '')
                              : f[col.key]}
                          </td>
                        ))}
                        <td className="px-2 md:px-4 py-2 text-xs md:text-sm text-[#4A4947] space-x-2 md:space-x-4">
                          <button
                            onClick={() => {
                              setEditingFastener(f);
                              setShowEditForm(true);
                            }}
                            className="text-[#B17457] hover:text-[#4A4947] underline font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFastener(f.id)}
                            className="text-[#B17457] hover:text-[#4A4947] underline font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedFasteners.length === 0 && (
                      <tr>
                        <td colSpan={columnsList.length + 2} className="px-2 md:px-4 py-2 text-center text-[#D8D2C2]">
                          No fasteners found.
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
            </div>
          </div>
        </main>
      </div>
      {/* Add FAB at bottom right of the screen with sidebar color theme */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {fabOpen && (
          <div className="mb-2 w-48 bg-[#181C23] border border-[#23272F] rounded shadow-lg">
            <button
              className="w-full px-4 py-2 text-left transition-colors group hover:bg-[#23272F] hover:text-[#B17457] text-[#F3F4F6]"
              onClick={() => { setShowAddForm(true); setFabOpen(false); }}
            >
              + Add New Fastener
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
      <AddFastenerForm isOpen={showAddForm} onClose={() => {
        setShowAddForm(false);
        fetchFasteners();
      }} categories={fastenersRoot ? [fastenersRoot] : []} />
      <AddCategoryForm
        isOpen={showAddCategoryForm}
        onClose={() => {
          setShowAddCategoryForm(false);
          fetchCategories();
        }}
        isFastener={true}
      />
      <EditFastenerForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        fastener={editingFastener}
        categories={fastenersRoot ? [fastenersRoot] : []}
        onUpdated={fetchFasteners}
      />
      <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Category Management">
        <FastenersCategoryTree
          categories={fastenerCategories}
          selectedId={null}
          onSelect={() => {}}
          showActions={true}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
        {(editCategoryLoading || deleteCategoryLoading) && (
          <div className="mt-4 text-sm text-[#B17457]">Processing...</div>
        )}
        {/* <button
          className="mt-4 px-4 py-2 bg-[#B17457] text-white rounded hover:bg-[#4A4947]"
          onClick={() => {
            const name = window.prompt('Enter new category name:');
            if (name) addFastenerCategory({ name });
          }}
        > */}
          {/* + Add Category
        </button> */}
      </Modal>
    </div>
  );
};

export default FastenersDashboard;
