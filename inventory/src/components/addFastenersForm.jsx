import React, { useState, useContext } from 'react';
import Modal from './modal';
import CategorySearchSelect from './CategorySearchSelect';
import { InventoryContext } from './inventoryContext';
import { Plus, Minus } from 'lucide-react';

const AddFastenerForm = ({ isOpen, onClose, categories }) => {
  const { categories: contextCategories } = useContext(InventoryContext);
  const [form, setForm] = useState({
    name: '',
    headShape: '',
    head: '',
    diameter: '',
    length: '',
    washer: '',
    material: '',
    od: '',
    id_dimension: '',
    thickness: '',
    plating: '',
    color: '',
    description: '',
    location: '',
    inStock: '',
    minimumStock: '',
    categoryId: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      inStock: parseInt(form.inStock) || 0,
      minimumStock: parseInt(form.minimumStock) || 0,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null
    };
    await fetch('http://localhost:5000/api/fasteners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    onClose();
    setForm({
      name: '',
      headShape: '',
      head: '',
      diameter: '',
      length: '',
      washer: '',
      material: '',
      od: '',
      id_dimension: '',
      thickness: '',
      plating: '',
      color: '',
      description: '',
      location: '',
      inStock: '',
      minimumStock: '',
      categoryId: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Fastener">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Material</label>
            <input
              type="text"
              value={form.material}
              onChange={e => setForm({ ...form, material: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">OD</label>
            <input
              type="text"
              value={form.od}
              onChange={e => setForm({ ...form, od: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ID</label>
            <input
              type="text"
              value={form.id_dimension}
              onChange={e => setForm({ ...form, id_dimension: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Thickness</label>
            <input
              type="text"
              value={form.thickness}
              onChange={e => setForm({ ...form, thickness: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plating</label>
            <input
              type="text"
              value={form.plating}
              onChange={e => setForm({ ...form, plating: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="text"
              value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <CategorySearchSelect
              selectedId={form.categoryId}
              onSelect={id => setForm({ ...form, categoryId: id })}
              categories={categories}
              isFastener={true}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">In Stock</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, inStock: Math.max(0, parseInt(f.inStock) || 0 - 1) }))}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={form.inStock}
                onChange={e => setForm({ ...form, inStock: e.target.value })}
                className="flex-1 p-3 border border-gray-300 rounded-lg text-center"
                min="0"
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, inStock: (parseInt(f.inStock) || 0) + 1 }))}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Stock</label>
            <input
              type="number"
              value={form.minimumStock}
              onChange={e => setForm({ ...form, minimumStock: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Head Shape</label>
            <input
              type="text"
              value={form.headShape}
              onChange={e => setForm({ ...form, headShape: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Head</label>
            <input
              type="text"
              value={form.head}
              onChange={e => setForm({ ...form, head: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Diameter</label>
            <input
              type="text"
              value={form.diameter}
              onChange={e => setForm({ ...form, diameter: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <input
              type="text"
              value={form.length}
              onChange={e => setForm({ ...form, length: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Washer?</label>
            <input
              type="text"
              value={form.washer}
              onChange={e => setForm({ ...form, washer: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
          <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFastenerForm;
