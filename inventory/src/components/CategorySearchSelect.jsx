import React, { useContext, useMemo, useState } from 'react';
import { InventoryContext } from './inventoryContext';


const flattenCategories = (categories, parentPath = []) => {
  let result = [];
  for (const category of categories) {
    const currentPath = [...parentPath, category.name];
    result.push({
      id: category.id,
      name: category.name,
      path: currentPath.join(' > ')
    });
    if (category.children && category.children.length > 0) {
      result = result.concat(flattenCategories(category.children, currentPath));
    }
  }
  return result;
};

const CategorySearchSelect = ({ selectedId, onSelect, categories: propCategories }) => {
  const context = useContext(InventoryContext);
  const categories = propCategories || context.categories;
  const allCategories = useMemo(() => flattenCategories(categories), [categories]);

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCategory = allCategories.find(cat => cat.id === selectedId);

  const filtered = allCategories.filter(cat =>
    cat.path.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search category..."
        value={selectedCategory ? selectedCategory.path : query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="w-full p-3 border border-gray-300 rounded-lg"
      />
      {showDropdown && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto w-full shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((cat) => (
              <li
                key={cat.id}
                onClick={() => {
                  onSelect(cat.id);
                  setQuery(cat.path);
                  setShowDropdown(false);
                }}
                className={`p-3 text-sm cursor-pointer hover:bg-blue-100 ${
                  selectedId === cat.id ? 'bg-blue-50 font-medium' : ''
                }`}
              >
                {cat.path}
              </li>
            ))
          ) : (
            <li className="p-3 text-sm text-gray-500">No matching category</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CategorySearchSelect;
