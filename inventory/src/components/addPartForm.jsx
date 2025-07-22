import React, { useContext, useState } from 'react';
import { InventoryContext } from './inventoryContext';
import Modal from './modal';
import CategorySearchSelect from './CategorySearchSelect';

const AddPartForm = ({ isOpen, onClose }) => {
  const { addPart } = useContext(InventoryContext);
  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    package: '',
    categoryId: '',
    description: '',
    inStock: '',
    minimumStock: '',
    location: '',
    comments: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.partNumber || !formData.categoryId) {
      alert('Please fill in all required fields');
      return;
    }

    addPart({
      ...formData,
      inStock: parseInt(formData.inStock) || 0,
      minimumStock: parseInt(formData.minimumStock) || 0,
      categoryId: parseInt(formData.categoryId),
      location: formData.location || ''
    });

    setFormData({
      name: '',
      partNumber: '',
      package: '',
      categoryId: '',
      description: '',
      inStock: '',
      minimumStock: '',
      location: '',
      comments: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Part">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part Number *</label>
            <input
              type="text"
              value={formData.partNumber}
              onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
            <input
              type="text"
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <CategorySearchSelect
              selectedId={formData.categoryId}
              onSelect={(id) => setFormData({ ...formData, categoryId: id })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
            <input
              type="number"
              value={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              min="0"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
            <input
              type="number"
              value={formData.minimumStock}
              onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., Shelf A2, Drawer 5"
            />
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="2"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600"
          >
            Add Part
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

export default AddPartForm;
