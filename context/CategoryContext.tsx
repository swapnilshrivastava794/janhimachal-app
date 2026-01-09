import React, { createContext, useState, useContext } from 'react';

type CategoryContextType = {
  selectedSubcategoryId: number | null;
  setSelectedSubcategoryId: (id: number) => void;
  selectedCategoryName: string | null;
  setSelectedCategoryName: (name: string) => void;
};

const CategoryContext = createContext<CategoryContextType>({
  selectedSubcategoryId: null,
  setSelectedSubcategoryId: () => {},
  selectedCategoryName: null,
  setSelectedCategoryName: () => {},
});

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to null, will be set by CustomHeader after API fetch
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null); 
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  return (
    <CategoryContext.Provider value={{ selectedSubcategoryId, setSelectedSubcategoryId, selectedCategoryName, setSelectedCategoryName }}>
      {children}
    </CategoryContext.Provider>
  );
};
