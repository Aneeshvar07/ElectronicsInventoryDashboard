// //New Working with nested categories version

// import React, { createContext, useState, useEffect } from 'react';

// export const InventoryContext = createContext();

// export const InventoryProvider = ({ children }) => {
//   const [parts, setParts] = useState([]);
//   const [fasteners, setFasteners] = useState([]);
//   const [categories, setCategories] = useState([]);       // Nested tree (for tree view)
//   const [flatCategories, setFlatCategories] = useState([]); // Flat list (for path lookups)

//   // 🔧 Helper: Build nested category tree from flat list
//   const buildCategoryTree = (flatList) => {
//     const map = new Map();
//     const roots = [];

//     // Add all categories to map with empty children
//     flatList.forEach(cat => {
//       map.set(cat.id, { ...cat, children: [] });
//     });

//     // Assign children to parents
//     flatList.forEach(cat => {
//       if (cat.parentId) {
//         const parent = map.get(cat.parentId);
//         if (parent) {
//           parent.children.push(map.get(cat.id));
//         }
//       } else {
//         roots.push(map.get(cat.id));
//       }
//     });

//     return roots;
//   };

//   // 📦 Load parts and categories on startup
//   useEffect(() => {
//     fetch('http://localhost:5000/api/parts')
//       .then(res => res.json())
//       .then(setParts)
//       .catch(err => console.error('❌ Failed to load parts:', err));
//     fetch('http://localhost:5000/api/fasteners')
//       .then(res => res.json())
//       .then(setFasteners)
//       .catch(err => console.error('❌ Failed to load fasteners:', err));
//     fetch('http://localhost:5000/api/categories')
//       .then(res => res.json())
//       .then(data => {
//         setFlatCategories(data);                  // Keep flat list
//         setCategories(buildCategoryTree(data));   // And nested tree
//       })
//       .catch(err => console.error('❌ Failed to load categories:', err));
//   }, []);

//   // ➕ Add new part
//   const addPart = (part) => {
//     fetch('http://localhost:5000/api/parts', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(part),
//     })
//       .then(res => res.json())
//       .then(data => {
//         setParts(prev => [...prev, { ...part, id: data.id }]);
//       })
//       .catch(err => console.error('❌ Failed to add part:', err));
//   };

//   // ✏️ Update part locally (optional: implement PUT on backend later)
//   // const updatePart = (id, updatedPart) => {
//   //   setParts(parts.map(p => (p.id === id ? { ...p, ...updatedPart } : p)));
//   // };

//   const updatePart = (id, updatedPart) => {
//     fetch(`http://localhost:5000/api/parts/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updatedPart),
//     })
//       .then(res => res.json())
//       .then(() => {
//         // Refetch all parts to ensure state matches DB
//         return fetch('http://localhost:5000/api/parts');
//       })
//       .then(res => res.json())
//       .then(setParts)
//       .catch(err => console.error('❌ Failed to update part:', err));
//   };

//   // 🗑 Delete part
//   const deletePart = (id) => {
//     fetch(`http://localhost:5000/api/parts/${id}`, {
//       method: 'DELETE',
//     })
//       .then(() => {
//         setParts(prev => prev.filter(p => p.id !== id));
//       })
//       .catch(err => console.error('❌ Failed to delete part:', err));
//   };

//   //Add Fasteners
//   const addFastener = (fastener) => {
//     fetch('http://localhost:5000/api/fasteners', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(fastener),
//     })
//       .then(res => res.json())
//       .then(data => {
//         setFasteners(prev => [...prev, { ...fastener, id: data.id }]);
//       })
//       .catch(err => console.error('❌ Failed to add fastener:', err));
//   };
  
//   const updateFastener = (id, updatedFastener) => {
//     fetch(`http://localhost:5000/api/fasteners/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updatedFastener),
//     })
//       .then(res => res.json())
//       .then(() => {
//         return fetch('http://localhost:5000/api/fasteners');
//       })
//       .then(res => res.json())
//       .then(setFasteners)
//       .catch(err => console.error('❌ Failed to update fastener:', err));
//   };
  
//   const deleteFastener = (id) => {
//     fetch(`http://localhost:5000/api/fasteners/${id}`, {
//       method: 'DELETE',
//     })
//       .then(() => {
//         setFasteners(prev => prev.filter(f => f.id !== id));
//       })
//       .catch(err => console.error('❌ Failed to delete fastener:', err));
//   };
  

//   // ➕ Add new category (auto updates tree and flat list)
//   const addCategory = (category, parentId = null) => {
//     fetch('http://localhost:5000/api/categories', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name: category.name, parentId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         const newCategory = {
//           ...category,
//           id: data.id,
//           parentId,
//           children: [],
//         };

//         // ✅ Update flat list
//         setFlatCategories(prev => [...prev, newCategory]);

//         // ✅ Update nested tree
//         setCategories(prev => {
//           if (!parentId) return [...prev, newCategory];

//       const addToParent = (cats) => {
//         return cats.map(cat => {
//           if (cat.id === parentId) {
//                 return {
//                   ...cat,
//                   children: [...(cat.children || []), newCategory],
//                 };
//           }
//               return {
//                 ...cat,
//                 children: addToParent(cat.children || []),
//               };
//             });
//           };

//           return addToParent(prev);
//         });
//       })
//       .catch(err => console.error('❌ Failed to add category:', err));
//   };

//   // 📝 Edit category
//   const editCategory = (id, newName) => {
//     return fetch(`http://localhost:5000/api/categories/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name: newName }),
//     })
//       .then(res => {
//         if (!res.ok) throw new Error('Failed to edit category');
//         return fetch('http://localhost:5000/api/categories');
//       })
//       .then(res => res.json())
//       .then(data => {
//         setFlatCategories(data);
//         setCategories(buildCategoryTree(data));
//         });
//       };

//   // 🗑 Delete category
//   const deleteCategory = (id) => {
//     return fetch(`http://localhost:5000/api/categories/${id}`, {
//       method: 'DELETE',
//     })
//       .then(res => {
//         if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to delete category'); });
//         return fetch('http://localhost:5000/api/categories');
//       })
//       .then(res => res.json())
//       .then(data => {
//         setFlatCategories(data);
//         setCategories(buildCategoryTree(data));
//       });
//   };

//   // 📁 Get full path of a category ID (e.g., "Passive > Resistors > SMD")
//   const getCategoryPath = (categoryId) => {
//     const map = new Map(flatCategories.map(cat => [cat.id, cat]));

//     const buildPath = (id) => {
//       const cat = map.get(id);
//       if (!cat) return [];
//       return cat.parentId ? [...buildPath(cat.parentId), cat.name] : [cat.name];
//     };

//     return buildPath(categoryId);
//   };

//   return (
//     <InventoryContext.Provider
//       value={{
//       parts,
//         categories,       // nested structure
//         flatCategories,   // flat structure (optional)
//       addPart,
//       updatePart,
//       deletePart,
//       addCategory,
//         getCategoryPath,
//         editCategory,
//         deleteCategory,
//         fasteners,
// addFastener,
// updateFastener,
// deleteFastener,

//       }}
//     >
//       {children}
//     </InventoryContext.Provider>
//   );
// };



// Updated InventoryContext with Fasteners Categories API support

import React, { createContext, useState, useEffect } from 'react';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [parts, setParts] = useState([]);
  const [fasteners, setFasteners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [fastenerCategories, setFastenerCategories] = useState([]);
  const [flatFastenerCategories, setFlatFastenerCategories] = useState([]);

  const buildCategoryTree = (flatList) => {
    const map = new Map();
    const roots = [];

    flatList.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    flatList.forEach(cat => {
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children.push(map.get(cat.id));
        }
      } else {
        roots.push(map.get(cat.id));
      }
    });

    return roots;
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/parts')
      .then(res => res.json())
      .then(setParts)
      .catch(err => console.error('❌ Failed to load parts:', err));
    fetch('http://localhost:5000/api/fasteners')
      .then(res => res.json())
      .then(setFasteners)
      .catch(err => console.error('❌ Failed to load fasteners:', err));
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        setFlatCategories(data);
        setCategories(buildCategoryTree(data));
      })
      .catch(err => console.error('❌ Failed to load categories:', err));
    fetch('http://localhost:5000/api/fastener-categories')
      .then(res => res.json())
      .then(data => {
        setFlatFastenerCategories(data);
        setFastenerCategories(buildCategoryTree(data));
      })
      .catch(err => console.error('❌ Failed to load fastener categories:', err));
  }, []);

  const addPart = (part) => {
    fetch('http://localhost:5000/api/parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    })
      .then(res => res.json())
      .then(data => {
        setParts(prev => [...prev, { ...part, id: data.id }]);
      })
      .catch(err => console.error('❌ Failed to add part:', err));
  };

  const updatePart = (id, updatedPart) => {
    fetch(`http://localhost:5000/api/parts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPart),
    })
      .then(res => res.json())
      .then(() => fetch('http://localhost:5000/api/parts'))
      .then(res => res.json())
      .then(setParts)
      .catch(err => console.error('❌ Failed to update part:', err));
  };

  const deletePart = (id) => {
    fetch(`http://localhost:5000/api/parts/${id}`, { method: 'DELETE' })
      .then(() => {
        setParts(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => console.error('❌ Failed to delete part:', err));
  };

  const addFastener = (fastener) => {
    fetch('http://localhost:5000/api/fasteners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fastener),
    })
      .then(res => res.json())
      .then(data => {
        setFasteners(prev => [...prev, { ...fastener, id: data.id }]);
      })
      .catch(err => console.error('❌ Failed to add fastener:', err));
  };
  
  const updateFastener = (id, updatedFastener) => {
    fetch(`http://localhost:5000/api/fasteners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFastener),
    })
      .then(res => res.json())
      .then(() => fetch('http://localhost:5000/api/fasteners'))
      .then(res => res.json())
      .then(setFasteners)
      .catch(err => console.error('❌ Failed to update fastener:', err));
  };
  
  const deleteFastener = (id) => {
    fetch(`http://localhost:5000/api/fasteners/${id}`, { method: 'DELETE' })
      .then(() => {
        setFasteners(prev => prev.filter(f => f.id !== id));
      })
      .catch(err => console.error('❌ Failed to delete fastener:', err));
  };
  
  const addCategory = (category, parentId = null) => {
    fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: category.name, parentId }),
    })
      .then(res => res.json())
      .then(data => {
        const newCategory = { ...category, id: data.id, parentId, children: [] };
        setFlatCategories(prev => [...prev, newCategory]);
        setCategories(prev => {
          if (!parentId) return [...prev, newCategory];
          const addToParent = (cats) => cats.map(cat => {
          if (cat.id === parentId) {
              return { ...cat, children: [...(cat.children || []), newCategory] };
          }
            return { ...cat, children: addToParent(cat.children || []) };
            });
          return addToParent(prev);
        });
      })
      .catch(err => console.error('❌ Failed to add category:', err));
  };

  const editCategory = (id, newName) => {
    return fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to edit category');
        return fetch('http://localhost:5000/api/categories');
      })
      .then(res => res.json())
      .then(data => {
        setFlatCategories(data);
        setCategories(buildCategoryTree(data));
        });
      };

  const deleteCategory = (id) => {
    return fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to delete category'); });
        return fetch('http://localhost:5000/api/categories');
      })
      .then(res => res.json())
      .then(data => {
        setFlatCategories(data);
        setCategories(buildCategoryTree(data));
      });
  };

  const getCategoryPath = (categoryId) => {
    const map = new Map(flatCategories.map(cat => [cat.id, cat]));
    const buildPath = (id) => {
      const cat = map.get(id);
      if (!cat) return [];
      return cat.parentId ? [...buildPath(cat.parentId), cat.name] : [cat.name];
    };
    return buildPath(categoryId);
  };

  const addFastenerCategory = (category, parentId = null) => {
    fetch('http://localhost:5000/api/fastener-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: category.name, parentId }),
    })
      .then(res => res.json())
      .then(data => {
        const newCategory = { ...category, id: data.id, parentId, children: [] };
        setFlatFastenerCategories(prev => [...prev, newCategory]);
        setFastenerCategories(prev => {
          if (!parentId) return [...prev, newCategory];
          const addToParent = (cats) => cats.map(cat => {
            if (cat.id === parentId) {
              return { ...cat, children: [...(cat.children || []), newCategory] };
            }
            return { ...cat, children: addToParent(cat.children || []) };
          });
          return addToParent(prev);
        });
      })
      .catch(err => console.error('❌ Failed to add fastener category:', err));
  };

  const editFastenerCategory = (id, newName) => {
    return fetch(`http://localhost:5000/api/fastener-categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to edit fastener category');
        return fetch('http://localhost:5000/api/fastener-categories');
      })
      .then(res => res.json())
      .then(data => {
        setFlatFastenerCategories(data);
        setFastenerCategories(buildCategoryTree(data));
      });
  };

  const deleteFastenerCategory = (id) => {
    return fetch(`http://localhost:5000/api/fastener-categories/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Failed to delete fastener category'); });
        return fetch('http://localhost:5000/api/fastener-categories');
      })
      .then(res => res.json())
      .then(data => {
        setFlatFastenerCategories(data);
        setFastenerCategories(buildCategoryTree(data));
      });
  };

  const getFastenerCategoryPath = (categoryId) => {
    const map = new Map(flatFastenerCategories.map(cat => [cat.id, cat]));
    const buildPath = (id) => {
      const cat = map.get(id);
      if (!cat) return [];
      return cat.parentId ? [...buildPath(cat.parentId), cat.name] : [cat.name];
    };
    return buildPath(categoryId);
  };

  return (
    <InventoryContext.Provider
      value={{
      parts,
        categories,
        flatCategories,
        fasteners,
        fastenerCategories,
        flatFastenerCategories,
      addPart,
      updatePart,
      deletePart,
      addCategory,
        getCategoryPath,
        editCategory,
        deleteCategory,
addFastener,
updateFastener,
deleteFastener,
        addFastenerCategory,
        editFastenerCategory,
        deleteFastenerCategory,
        getFastenerCategoryPath,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
