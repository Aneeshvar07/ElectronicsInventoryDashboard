import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash } from 'lucide-react';

const FastenersCategoryTree = ({ categories = [], selectedId, onSelect, level = 0, showActions = false, onEdit, onDelete }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const children = Array.isArray(category.children) ? category.children : [];

        return (
          <div key={category.id}>
            <div
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                selectedId === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-[#23272F] hover:text-[#B17457]'
              }`}
              style={{ paddingLeft: `${level * 20 + 8}px` }}
              onClick={() => onSelect(category.id)}
            >
              {children.length > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(category.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <span className="text-sm select-none flex-1">{category.name}</span>
              {showActions && (
                <span className="flex gap-1 ml-2">
                  <button
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    onClick={e => { e.stopPropagation(); onEdit && onEdit(category); }}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    onClick={e => { e.stopPropagation(); onDelete && onDelete(category); }}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </button>
                </span>
              )}
            </div>

            {expandedCategories.has(category.id) && children.length > 0 && (
              <FastenersCategoryTree
                categories={children}
                selectedId={selectedId}
                onSelect={onSelect}
                level={level + 1}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FastenersCategoryTree; 