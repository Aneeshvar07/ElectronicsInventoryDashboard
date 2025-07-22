import React, { useContext, useState } from 'react';
import { InventoryContext } from './inventoryContext';
import Modal from './modal';
import CategoryTree from './categoryTree';
import FastenersCategoryTree from './FastenersCategoryTree';

const AddCategoryForm = ({ isOpen, onClose, isFastener = false }) => {
  const {
    addCategory,
    categories,
    addFastenerCategory,
    fastenerCategories
  } = useContext(InventoryContext);
  const [formData, setFormData] = useState({
    name: '',
    parentId: null
  });

  const [mode, setMode] = useState('top'); // 'top' or 'sub'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }
    const parent = mode === 'sub' ? formData.parentId : null;
    if (isFastener) {
      addFastenerCategory({ name: formData.name }, parent);
    } else {
      addCategory({ name: formData.name }, parent);
    }
    setFormData({ name: '', parentId: null });
    setMode('top');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Category" size="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex gap-3">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              mode === 'top' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => {
              setMode('top');
              setFormData({ ...formData, parentId: null });
            }}
          >
            Top-Level Category
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              mode === 'sub' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setMode('sub')}
          >
            Sub-Category
          </button>
        </div>
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          />
        </div>
        {/* Parent Category Tree */}
        {mode === 'sub' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent Category</label>
            <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto bg-white">
              {isFastener ? (
                <FastenersCategoryTree
                  categories={fastenerCategories}
                  selectedId={formData.parentId}
                  onSelect={(id) => setFormData({ ...formData, parentId: id })}
                />
              ) : (
              <CategoryTree
                categories={categories}
                selectedId={formData.parentId}
                onSelect={(id) => setFormData({ ...formData, parentId: id })}
              />
              )}
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600"
          >
            Add Category
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategoryForm;
