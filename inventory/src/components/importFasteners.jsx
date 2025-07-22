import React, { useContext } from 'react';
import * as XLSX from 'xlsx';
import { InventoryContext } from './inventoryContext';

const ImportFasteners = ({ currentCategoryId }) => {
  const { addFastener, fastenerCategories } = useContext(InventoryContext);

  // Helper: Build flat list of all fastener categories
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
  // Use fastenerCategories from context (already nested)
  const fastenerCategoriesFlat = fastenerCategories.flatMap(collectDescendants);

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
  const categoryTree = buildCategoryTree(fastenerCategoriesFlat);

  console.log("Current category from UI:", currentCategoryId);


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !currentCategoryId) {
      alert("Please select a category before importing.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      let imported = 0;

      json.forEach(row => {
        let categoryName = row.category || row.Category || '';
        let categoryId = currentCategoryId;
        if (categoryName) {
          const match = fastenerCategoriesFlat.find(cat => cat.name && cat.name.toLowerCase() === categoryName.toLowerCase());
          if (match) categoryId = match.id;
        }
        const fastener = {
          name: row.name || row.Name || '',
          headShape: row.headShape || row['Head Shape'] || '',
          head: row.head || row.Head || '',
          diameter: row.diameter || row.Diameter || '',
          length: row.length || row.Length || '',
          washer: row.washer || row.Washer || row['Washer?'] || '',
          material: row.material || row.Material || '',
          od: row.od || row.OD || '',
          id_dimension: row.id_dimension || row.ID || '',
          thickness: row.thickness || row.Thickness || '',
          plating: row.plating || row.Plating || '',
          color: row.color || row.Color || '',
          description: row.description || row.Description || '',
          location: row.location || row.Location || '',
          inStock: parseInt(row.inStock || row['In Stock'] || 0) || 0,
          minimumStock: parseInt(row.minimumStock || row.MinStock || row['Min Stock'] || 0) || 0,
          categoryId,
        };
        if (fastener.name) {
          addFastener(fastener);
          imported++;
        }
      });
      
      alert(`${imported} fasteners imported to current category.`);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="px-4 py-2 bg-[#B17457] text-white rounded-lg hover:bg-[#4A4947] cursor-pointer"
      />
    </div>
  );
};

export default ImportFasteners; 