// Working Import generic tempelate

import React, { useContext } from 'react';
import * as XLSX from 'xlsx';
import { InventoryContext } from './inventoryContext';

const ImportParts = ({ currentCategoryId }) => {
  const { addPart } = useContext(InventoryContext);

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
        const part = {
          name: row.name || '',
          partNumber: row.partNumber || '',
          package: row.package || '',
          description: row.description || '',
          inStock: parseInt(row.inStock) || 0,
          minimumStock: parseInt(row.minimumStock) || 0,
          location: row.location || '',
          comments: row.comments || '',
          categoryId: currentCategoryId
        };

        if (part.name && part.partNumber) {
          addPart(part);
          imported++;
        }
      });

      alert(`${imported} parts imported to current category.`);
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

export default ImportParts;



//Testing Import with new excel format for Resistors

// import React, { useContext, useRef, useState } from 'react';
// import * as XLSX from 'xlsx';
// import { InventoryContext } from './inventoryContext';

// const ImportParts = ({ currentCategoryId }) => {
//   const { addPart } = useContext(InventoryContext);
//   const fileInputRef = useRef();
//   const [importing, setImporting] = useState(false);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file || !currentCategoryId) {
//       alert("Please select a category before importing.");
//       return;
//     }

//     setImporting(true);

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const data = new Uint8Array(evt.target.result);
//       const workbook = XLSX.read(data, { type: 'array' });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

//       const packageColumns = Object.keys(json[0]).filter(
//         col => /^\d{4}$/.test(col.trim()) // e.g., 0402, 0603, 0805, etc.
//       );

//       let imported = 0;

//       json.forEach(row => {
//         const baseName = row["Resistor Value"];
//         const partNumber = row["Partnumber"] || '';
//         const description = row["Description"] || '';
//         const minStock = parseInt(row["Min Stock"]) || 0;
//         const location = row["Location"] || '';
//         const comments = row["Comments"] || '';

//         if (!baseName) return;

//         packageColumns.forEach(pkg => {
//           const qty = row[pkg];
//           const parsedQty = qty === '' ? 0 : parseInt(qty);
//           if (!isNaN(parsedQty)) {
//             const part = {
//               name: baseName,
//               partNumber,
//               package: pkg,
//               description,
//               inStock: parsedQty,
//               minimumStock: minStock,
//               location,
//               comments,
//               categoryId: currentCategoryId,
//             };

//             addPart(part);
//             imported++;
//           }
//         });
//       });

//       setImporting(false);
//       alert(`✅ Imported ${imported} parts to current category.`);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   return (
//     <div>
//       {/* Importing overlay */}
//       {importing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//           <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
//             <svg className="animate-spin h-8 w-8 text-[#B17457] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#B17457" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="#B17457" d="M4 12a8 8 0 018-8v8z"></path>
//             </svg>
//             <div className="text-[#B17457] font-semibold text-lg">Importing parts...</div>
//             <div className="text-[#4A4947] text-sm mt-2">Please wait, this may take a while for large files.</div>
//           </div>
//         </div>
//       )}
//       {/* Hidden file input */}
//       <input
//         type="file"
//         accept=".xlsx,.xls,.csv"
//         onChange={handleFileUpload}
//         ref={fileInputRef}
//         className="hidden"
//       />
//       {/* Custom Import button */}
//       <button
//         type="button"
//         onClick={() => fileInputRef.current.click()}
//         className="bg-[#B17457] hover:bg-[#4A4947] text-white px-4 py-2 rounded-lg font-semibold shadow-md text-sm transition-colors"
//         disabled={importing}
//       >
//         Import
//       </button>
//     </div>
//   );
// };

// export default ImportParts;