'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';

const CategoriesSettingsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categories, setCategories] = useState([
    {
      id: 'computer',
      name: 'Computer',
      prefix: 'COM',
      subcategories: [
        { id: 'laptop', name: 'Laptop', code: 'LAP' },
        { id: 'desktop', name: 'Desktop', code: 'DES' },
        { id: 'server', name: 'Server', code: 'SER' }
      ]
    },
    {
      id: 'external',
      name: 'External Device',
      prefix: 'EXT',
      subcategories: [
        { id: 'monitor', name: 'Monitor', code: 'MON' },
        { id: 'keyboard', name: 'Keyboard', code: 'KEY' },
        { id: 'mouse', name: 'Mouse', code: 'MOU' }
      ]
    },
    {
      id: 'furniture',
      name: 'Furniture',
      prefix: 'FUR',
      subcategories: [
        { id: 'chair', name: 'Chair', code: 'CHA' },
        { id: 'desk', name: 'Desk', code: 'DES' },
        { id: 'cabinet', name: 'Cabinet', code: 'CAB' }
      ]
    }
  ]);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    prefix: ''
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    code: ''
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = () => {
    setCategoryForm({ name: '', prefix: '' });
    setShowAddCategory(true);
  };

  const handleAddSubcategory = (category) => {
    setSelectedCategory(category);
    setSubcategoryForm({ name: '', code: '' });
    setShowAddSubcategory(true);
  };

  const handleEditCategory = (category) => {
    setCategoryForm({ name: category.name, prefix: category.prefix });
    setSelectedCategory(category);
    setShowAddCategory(true);
  };

  const handleEditSubcategory = (category, subcategory) => {
    setSelectedCategory(category);
    setSubcategoryForm({ name: subcategory.name, code: subcategory.code });
    setShowAddSubcategory(true);
  };

  const handleDeleteCategory = (category) => {
    if (confirm(`Are you sure you want to delete ${category.name}? This will also delete all subcategories.`)) {
      setCategories(prev => prev.filter(cat => cat.id !== category.id));
      toast.success(`${category.name} has been deleted successfully`);
    }
  };

  const handleDeleteSubcategory = (category, subcategory) => {
    if (confirm(`Are you sure you want to delete ${subcategory.name}?`)) {
      setCategories(prev => prev.map(cat => 
        cat.id === category.id 
          ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategory.id) }
          : cat
      ));
      toast.success(`${subcategory.name} has been deleted successfully`);
    }
  };

  const handleSubmitCategory = () => {
    if (selectedCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...cat, name: categoryForm.name, prefix: categoryForm.prefix }
          : cat
      ));
      toast.success('Category updated successfully');
    } else {
      // Add new category
      const newCategory = {
        id: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: categoryForm.name,
        prefix: categoryForm.prefix,
        subcategories: []
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success('Category added successfully');
    }
    
    setShowAddCategory(false);
    setSelectedCategory(null);
  };

  const handleSubmitSubcategory = () => {
    if (selectedCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id 
          ? { 
              ...cat, 
              subcategories: [
                ...cat.subcategories,
                {
                  id: subcategoryForm.name.toLowerCase().replace(/\s+/g, '-'),
                  name: subcategoryForm.name,
                  code: subcategoryForm.code
                }
              ]
            }
          : cat
      ));
      toast.success('Subcategory added successfully');
    }
    
    setShowAddSubcategory(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
      
      <div className="flex">
        <Sidebar 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)}
          menuItems={ASSET_TRACKER_MENU_ITEMS.map(item => ({
            ...item,
            path: `/asset-tracker/${companyId}${item.path.replace('/asset-tracker', '')}`
          }))}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            <div className="space-y-6">
              {/* Page Header */}
              <PageHeader
                title="Category Management"
                description="Manage asset categories and subcategories"
                actions={[
                  <Button
                    key="add-category"
                    onClick={handleAddCategory}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Category
                  </Button>
                ]}
              />

              {/* Categories Tree */}
              <Card variant="glass">
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border border-neutral-200 rounded-lg">
                      {/* Category Header */}
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-t-lg border-b border-neutral-200">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="mr-3 p-1 hover:bg-white/10 rounded"
                          >
                            {expandedCategories[category.id] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-semibold text-neutral-900">{category.name}</h3>
                            <p className="text-sm text-neutral-600">Prefix: {category.prefix}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddSubcategory(category)}
                            icon={<Plus className="w-4 h-4" />}
                          >
                            Add Subcategory
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            icon={<Edit className="w-4 h-4" />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            icon={<Trash2 className="w-4 h-4" />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {expandedCategories[category.id] && (
                        <div className="p-4 border-t border-neutral-200 bg-white">
                          <div className="space-y-2">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded border border-neutral-200">
                                <div>
                                  <span className="font-medium text-neutral-900">{subcategory.name}</span>
                                  <span className="ml-2 text-sm text-neutral-600">Code: {subcategory.code}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSubcategory(category, subcategory)}
                                    icon={<Edit className="w-4 h-4" />}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubcategory(category, subcategory)}
                                    icon={<Trash2 className="w-4 h-4" />}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {category.subcategories.length === 0 && (
                              <p className="text-sm text-neutral-600 italic">No subcategories</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        title={selectedCategory ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            label="Prefix (3 characters)"
            value={categoryForm.prefix}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, prefix: e.target.value.toUpperCase() }))}
            maxLength={3}
            required
            placeholder="e.g., COM"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowAddCategory(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitCategory}>
              {selectedCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subcategory Modal */}
      <Modal
        isOpen={showAddSubcategory}
        onClose={() => setShowAddSubcategory(false)}
        title="Add Subcategory"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600">
              Adding subcategory to: <strong>{selectedCategory?.name}</strong>
            </p>
          </div>
          
          <Input
            label="Subcategory Name"
            value={subcategoryForm.name}
            onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            label="Code (3 characters)"
            value={subcategoryForm.code}
            onChange={(e) => setSubcategoryForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            maxLength={3}
            required
            placeholder="e.g., LAP"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowAddSubcategory(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitSubcategory}>
              Add Subcategory
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesSettingsPage;
