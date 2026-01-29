import React, { createContext, useContext, useState } from 'react';

type CategoryContextType = {
  selectedSubcategoryId: number | null;
  setSelectedSubcategoryId: (id: number | null) => void;
  selectedCategoryName: string | null;
  setSelectedCategoryName: (name: string | null) => void;
  categories: any[];
  setCategories: (categories: any[]) => void;
  nextSubCategory: () => void;
  getNextCategoryInfo: () => { name: string; id: any; categoryName?: string; isNewCategory: boolean } | null;
};

const CategoryContext = createContext<CategoryContextType>({
  selectedSubcategoryId: null,
  setSelectedSubcategoryId: () => { },
  selectedCategoryName: null,
  setSelectedCategoryName: () => { },
  categories: [],
  setCategories: () => { },
  nextSubCategory: () => { },
  getNextCategoryInfo: () => null,
});

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to null, will be set by CustomHeader after API fetch
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  console.log('CategoryContext: selectedSubcategoryId is now', selectedSubcategoryId); // DEBUG LOG
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const getNextCategoryInfo = () => {
    if (!selectedSubcategoryId || !selectedCategoryName || categories.length === 0) return null;

    const currentCatIndex = categories.findIndex(c => c.cat_name === selectedCategoryName);
    if (currentCatIndex === -1) return null;

    const currentCategory = categories[currentCatIndex];
    if (!currentCategory.sub_categories) return null;

    const currentSubIndex = currentCategory.sub_categories.findIndex((s: any) => s.id === selectedSubcategoryId);

    // Check if there is a next subcategory
    if (currentSubIndex !== -1 && currentSubIndex < currentCategory.sub_categories.length - 1) {
      const nextSub = currentCategory.sub_categories[currentSubIndex + 1];
      return { name: nextSub.subcat_name, id: nextSub.id, isNewCategory: false };
    }
    // If no next subcategory, check if there is a next main category
    else if (currentCatIndex < categories.length - 1) {
      const nextCat = categories[currentCatIndex + 1];
      if (nextCat.sub_categories && nextCat.sub_categories.length > 0) {
        return { name: nextCat.sub_categories[0].subcat_name, categoryName: nextCat.cat_name, id: nextCat.sub_categories[0].id, isNewCategory: true };
      }
    }
    return null;
  };

  const nextSubCategory = () => {
    const nextInfo = getNextCategoryInfo();
    if (nextInfo) {
      if (nextInfo.isNewCategory && nextInfo.categoryName) {
        setSelectedCategoryName(nextInfo.categoryName);
      }
      setSelectedSubcategoryId(nextInfo.id);
      // console.log("Auto-switched to:", nextInfo.name);
    }
  };

  return (
    <CategoryContext.Provider value={{ selectedSubcategoryId, setSelectedSubcategoryId, selectedCategoryName, setSelectedCategoryName, categories, setCategories, nextSubCategory, getNextCategoryInfo }}>
      {children}
    </CategoryContext.Provider>
  );
};
