// Provider component
const InventoryProvider = ({ children }) => {
  const [parts, setParts] = useState(initialParts);
  const [categories, setCategories] = useState(initialCategories);
  const [nextPartId, setNextPartId] = useState(5);
  const [nextCategoryId, setNextCategoryId] = useState(15);

  const addPart = (part) => {
    const newPart = { ...part, id: nextPartId };
    setParts([...parts, newPart]);
    setNextPartId(nextPartId + 1);
  };

  const updatePart = (id, updatedPart) => {
    setParts(parts.map(part => part.id === id ? { ...part, ...updatedPart } : part));
  };

  const deletePart = (id) => {
    setParts(parts.filter(part => part.id !== id));
  };

  const addCategory = (category, parentId = null) => {
    const newCategory = { ...category, id: nextCategoryId, children: [] };
    setNextCategoryId(nextCategoryId + 1);

    if (parentId === null) {
      setCategories([...categories, newCategory]);
    } else {
      const addToParent = (cats) => {
        return cats.map(cat => {
          if (cat.id === parentId) {
            return { ...cat, children: [...cat.children, newCategory] };
          }
          return { ...cat, children: addToParent(cat.children) };
        });
      };
      setCategories(addToParent(categories));
    }
  };

  const getCategoryPath = (categoryId) => {
    const findPath = (cats, id, path = []) => {
      for (const cat of cats) {
        const currentPath = [...path, cat.name];
        if (cat.id === id) {
          return currentPath;
        }
        const childPath = findPath(cat.children, id, currentPath);
        if (childPath) {
          return childPath;
        }
      }
      return null;
    };
    return findPath(categories, categoryId) || [];
  };

  return (
    <InventoryContext.Provider value={{
      parts,
      categories,
      addPart,
      updatePart,
      deletePart,
      addCategory,
      getCategoryPath
    }}>
      {children}
    </InventoryContext.Provider>
  );
};