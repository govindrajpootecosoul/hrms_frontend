'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { useParams } from 'next/navigation';

const CategoryManagement = () => {
  const params = useParams();
  const companyId = params?.companyId;
  
  // Expand all categories by default
  const [expandedCategories, setExpandedCategories] = useState({
    '1': true,
    '2': true,
    '3': true,
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', prefix: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', prefix: '' });
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);

  const saveCategories = async (nextCategories) => {
    const payload = { companyId: companyId || 'default', categories: nextCategories };
    const res = await fetch('/api/asset-tracker/settings/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save categories');
    
    // Dispatch event to notify other components (like AssetForm) to refresh
    window.dispatchEvent(new CustomEvent('asset-settings-categories-updated', {
      detail: { categories: nextCategories }
    }));
  };

  // Load categories from settings API
  useEffect(() => {
    const load = async () => {
      try {
        const url = companyId
          ? `/api/asset-tracker/settings/categories?companyId=${companyId}`
          : '/api/asset-tracker/settings/categories';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          const raw = Array.isArray(data.data?.categories) ? data.data.categories : [];
          // Ensure assetCount fields exist for UI
          const normalized = raw.map((c) => ({
            ...c,
            subcategories: (c.subcategories || []).map((s) => ({ ...s, assetCount: s.assetCount || 0 })),
            totalAssets: c.totalAssets || 0,
          }));
          setCategories(normalized);
        }
      } catch (e) {
        console.error('Failed to load category settings:', e);
      }
    };
    load();
  }, [companyId]);

  // Fetch real asset counts from database
  useEffect(() => {
    const fetchAssetCounts = async () => {
      try {
        setLoading(true);
        const url = companyId 
          ? `/api/asset-tracker/category-counts?companyId=${companyId}`
          : '/api/asset-tracker/category-counts';
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data) {
          const { subcategoryCounts } = data.data;
          
          // Update categories with real counts
          setCategories(prevCategories => 
            prevCategories.map(category => {
              let totalAssets = 0;
              const updatedSubcategories = category.subcategories.map(subcategory => {
                const count = subcategoryCounts[subcategory.tagPrefix] || 0;
                totalAssets += count;
                return {
                  ...subcategory,
                  assetCount: count,
                };
              });
              
              return {
                ...category,
                subcategories: updatedSubcategories,
                totalAssets,
              };
            })
          );
        }
      } catch (error) {
        console.error('Error fetching asset counts:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch counts after categories are loaded
    if (categories.length > 0) fetchAssetCounts();
  }, [companyId, categories.length]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.prefix) {
      const next = [...categories, {
        id: Date.now().toString(),
        name: newCategory.name,
        prefix: newCategory.prefix.toUpperCase(),
        subcategories: [],
        totalAssets: 0,
      }];
      setCategories(next);
      saveCategories(next).catch((e) => console.error('Failed to save categories:', e));
      setNewCategory({ name: '', prefix: '' });
      setShowAddCategory(false);
    }
  };

  const handleAddSubcategory = (categoryId) => {
    if (newSubcategory.name && newSubcategory.prefix) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        const tagPrefix = `${category.prefix}-${newSubcategory.prefix.toUpperCase()}`;
        const next = categories.map(cat => 
          cat.id === categoryId
            ? {
                ...cat,
                subcategories: [...cat.subcategories, {
                  id: `${categoryId}-${Date.now()}`,
                  name: newSubcategory.name,
                  prefix: newSubcategory.prefix.toUpperCase(),
                  tagPrefix,
                  assetCount: 0,
                }]
              }
            : cat
        );
        setCategories(next);
        saveCategories(next).catch((e) => console.error('Failed to save categories:', e));
        setNewSubcategory({ name: '', prefix: '' });
        setShowAddSubcategory(null);
      }
    }
  };

  const handleDeleteCategory = (categoryId) => {
    if (confirm('Are you sure you want to delete this category? All subcategories will also be deleted.')) {
      const next = categories.filter((cat) => cat.id !== categoryId);
      setCategories(next);
      saveCategories(next).catch((e) => console.error('Failed to save categories:', e));
    }
  };

  const handleDeleteSubcategory = (categoryId, subcategoryId) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      const next = categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId),
              totalAssets: cat.totalAssets - (cat.subcategories.find(sub => sub.id === subcategoryId)?.assetCount || 0),
            }
          : cat
      );
      setCategories(next);
      saveCategories(next).catch((e) => console.error('Failed to save categories:', e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">Category Management</h2>
          <p className="text-xs text-neutral-600">Manage asset categories, subcategories, and tag prefixes</p>
        </div>
        <Button
          onClick={() => setShowAddCategory(true)}
          icon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Category
        </Button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-neutral-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="bg-white p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    {expandedCategories[category.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                    {category.prefix}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                    <p className="text-xs text-neutral-500">
                      {category.subcategories.length} subcategories • {category.totalAssets} assets
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSubcategory(category.id)}
                    className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Add Subcategory"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {expandedCategories[category.id] && (
              <div className="bg-neutral-50 p-4">
                <div className="flex flex-wrap gap-3">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-neutral-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-10 h-10 bg-neutral-600 text-white rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {subcategory.prefix}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-neutral-900">{subcategory.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono">{subcategory.tagPrefix}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-medium text-neutral-900">{subcategory.assetCount}</span>
                        <button
                          onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                          className="w-5 h-5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center justify-center transition-colors"
                          title="Delete Subcategory"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategory}
        onClose={() => {
          setShowAddCategory(false);
          setNewCategory({ name: '', prefix: '' });
        }}
        title="Add New Category"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name *"
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Computer Assets"
            required
          />
          <Input
            label="Category Prefix *"
            value={newCategory.prefix}
            onChange={(e) => setNewCategory(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
            placeholder="e.g. CA"
            required
            maxLength={3}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => {
                setShowAddCategory(false);
                setNewCategory({ name: '', prefix: '' });
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Category
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal
        isOpen={showAddSubcategory !== null}
        onClose={() => {
          setShowAddSubcategory(null);
          setNewSubcategory({ name: '', prefix: '' });
        }}
        title="Add New Subcategory"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Subcategory Name *"
            value={newSubcategory.name}
            onChange={(e) => setNewSubcategory(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Laptop"
            required
          />
          <Input
            label="Subcategory Prefix *"
            value={newSubcategory.prefix}
            onChange={(e) => setNewSubcategory(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
            placeholder="e.g. LAP"
            required
            maxLength={3}
          />
          {showAddSubcategory && (
            <div className="text-xs text-neutral-500">
              Tag prefix will be: {categories.find(c => c.id === showAddSubcategory)?.prefix}-{newSubcategory.prefix || 'XXX'}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => {
                setShowAddSubcategory(null);
                setNewSubcategory({ name: '', prefix: '' });
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAddSubcategory(showAddSubcategory)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Subcategory
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryManagement;

