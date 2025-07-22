import React, { useContext, useState, useMemo } from 'react';
import { InventoryContext } from './inventoryContext';
import FastenersSidebar from './FastenersSidebar';
import ImportFasteners from './importFasteners';
import FastenersTable from './fastenersDashbaord';

const FastenersDashboard = () => {
  const {
    fasteners,
    fastenerCategories,
    addFastenerCategory,
    deleteFastenerCategory,
    updateFastenerCategory,
  } = useContext(InventoryContext);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper to collect all subcategory ids under selectedCategoryId
  const collectCategoryAndDescendants = (catId) => {
    const result = [];
    const stack = [catId];
    while (stack.length) {
      const currentId = stack.pop();
      result.push(currentId);
      const children = fastenerCategories.filter(c => c.parentId === currentId);
      stack.push(...children.map(c => c.id));
    }
    return result;
  };

  // Filter fasteners based on selectedCategoryId
  const filteredFasteners = useMemo(() => {
    if (!selectedCategoryId) return fasteners;
    const allowedIds = collectCategoryAndDescendants(selectedCategoryId);
    return fasteners.filter(f => allowedIds.includes(f.categoryId));
  }, [fasteners, selectedCategoryId, fastenerCategories]);

  // Breadcrumb logic
  const getCategoryBreadcrumb = (catId) => {
    const trail = [];
    let current = fastenerCategories.find(c => c.id === catId);
    while (current) {
      trail.unshift(current);
      current = fastenerCategories.find(c => c.id === current.parentId);
    }
    return trail;
  };
  const breadcrumb = selectedCategoryId ? getCategoryBreadcrumb(selectedCategoryId) : [];

  return (
    <div className="flex h-screen bg-[#0F1117] text-white">
      {/* Sidebar */}
      <FastenersSidebar
        categories={fastenerCategories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenCategoryModal={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-[#B17457] mb-4">
          {breadcrumb.map((cat, idx) => (
            <span key={cat.id}>
              {idx > 0 && ' / '}
              {cat.name}
            </span>
          ))}
        </div>

        {/* Import + Table */}
        <div className="mb-4">
          <ImportFasteners currentCategoryId={selectedCategoryId} />
        </div>

        <FastenersTable fasteners={filteredFasteners} />
      </div>
    </div>
  );
};

export default FastenersDashboard;
