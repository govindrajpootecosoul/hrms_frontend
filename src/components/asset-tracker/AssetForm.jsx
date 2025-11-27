'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, Settings, Calendar } from 'lucide-react';
import { ASSET_CATEGORIES, ASSET_STATUS } from '@/lib/utils/constants';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';

const AssetForm = ({ 
  asset = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    category: asset?.category || '',
    subcategory: asset?.subcategory || '',
    location: asset?.location || '',
    site: asset?.site || '',
    status: asset?.status || 'available',
    
    // Step 2: Specifications
    brand: asset?.brand || '',
    model: asset?.model || '',
    serialNumber: asset?.serialNumber || '',
    
    // Step 3: Additional Details (dynamic based on category)
    ram: asset?.ram || '',
    processor: asset?.processor || '',
    storage: asset?.storage || '',
    warrantyStart: asset?.warrantyStart || '',
    warrantyEnd: asset?.warrantyEnd || '',
    purchaseDate: asset?.purchaseDate || '',
    purchasePrice: asset?.purchasePrice || '',
    notes: asset?.notes || ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: <Package className="w-5 h-5" /> },
    { id: 2, title: 'Specifications', icon: <Settings className="w-5 h-5" /> },
    { id: 3, title: 'Additional Details', icon: <Calendar className="w-5 h-5" /> }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.site) newErrors.site = 'Site is required';
        if (!formData.status) newErrors.status = 'Status is required';
        break;
      case 2:
        if (!formData.brand) newErrors.brand = 'Brand is required';
        if (!formData.model) newErrors.model = 'Model is required';
        if (!formData.serialNumber) newErrors.serialNumber = 'Serial number is required';
        break;
      case 3:
        // Dynamic validation based on category
        if (formData.category === 'computer') {
          if (!formData.ram) newErrors.ram = 'RAM is required for computers';
          if (!formData.processor) newErrors.processor = 'Processor is required for computers';
          if (!formData.storage) newErrors.storage = 'Storage is required for computers';
        }
        if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Generate asset tag
      const categoryPrefix = ASSET_CATEGORIES.find(c => c.id === formData.category)?.prefix || 'AST';
      const assetTag = `${categoryPrefix}${Date.now().toString().slice(-6)}`;
      
      onSubmit({
        ...formData,
        assetTag,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  };

  const getSubcategoryOptions = () => {
    const category = ASSET_CATEGORIES.find(c => c.id === formData.category);
    return category?.subcategories?.map(sub => ({ value: sub.id, label: sub.name })) || [];
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Category"
          options={ASSET_CATEGORIES.map(cat => ({ value: cat.id, label: cat.name }))}
          value={formData.category}
          onChange={(value) => {
            handleChange('category', value);
            handleChange('subcategory', ''); // Reset subcategory when category changes
          }}
          error={errors.category}
          required
        />
        
        <Select
          label="Subcategory"
          options={getSubcategoryOptions()}
          value={formData.subcategory}
          onChange={(value) => handleChange('subcategory', value)}
          error={errors.subcategory}
          required
          disabled={!formData.category}
        />
        
        <Select
          label="Location"
          options={[
            { value: 'office-1', label: 'Office Building 1' },
            { value: 'office-2', label: 'Office Building 2' },
            { value: 'warehouse', label: 'Warehouse' },
            { value: 'remote', label: 'Remote' }
          ]}
          value={formData.location}
          onChange={(value) => handleChange('location', value)}
          error={errors.location}
          required
        />
        
        <Select
          label="Site"
          options={[
            { value: 'floor-1', label: 'Floor 1' },
            { value: 'floor-2', label: 'Floor 2' },
            { value: 'floor-3', label: 'Floor 3' },
            { value: 'basement', label: 'Basement' }
          ]}
          value={formData.site}
          onChange={(value) => handleChange('site', value)}
          error={errors.site}
          required
        />
        
        <Select
          label="Status"
          options={ASSET_STATUS.map(status => ({ value: status.value, label: status.label }))}
          value={formData.status}
          onChange={(value) => handleChange('status', value)}
          error={errors.status}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Brand"
          value={formData.brand}
          onChange={(e) => handleChange('brand', e.target.value)}
          error={errors.brand}
          required
        />
        
        <Input
          label="Model"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
          error={errors.model}
          required
        />
        
        <div className="md:col-span-2">
          <Input
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            error={errors.serialNumber}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Dynamic fields based on category */}
      {formData.category === 'computer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="RAM"
            value={formData.ram}
            onChange={(e) => handleChange('ram', e.target.value)}
            error={errors.ram}
            required
            placeholder="e.g., 16GB DDR4"
          />
          
          <Input
            label="Processor"
            value={formData.processor}
            onChange={(e) => handleChange('processor', e.target.value)}
            error={errors.processor}
            required
            placeholder="e.g., Intel i7-10700K"
          />
          
          <Input
            label="Storage"
            value={formData.storage}
            onChange={(e) => handleChange('storage', e.target.value)}
            error={errors.storage}
            required
            placeholder="e.g., 512GB SSD"
          />
        </div>
      )}

      {/* Warranty information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Warranty Start Date"
          type="date"
          value={formData.warrantyStart}
          onChange={(e) => handleChange('warrantyStart', e.target.value)}
        />
        
        <Input
          label="Warranty End Date"
          type="date"
          value={formData.warrantyEnd}
          onChange={(e) => handleChange('warrantyEnd', e.target.value)}
        />
      </div>

      {/* Purchase information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Purchase Date"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => handleChange('purchaseDate', e.target.value)}
          error={errors.purchaseDate}
          required
        />
        
        <Input
          label="Purchase Price"
          type="number"
          value={formData.purchasePrice}
          onChange={(e) => handleChange('purchasePrice', e.target.value)}
          placeholder="0.00"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all duration-200 bg-white text-neutral-900 placeholder-neutral-400"
          placeholder="Additional notes about the asset..."
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${currentStep >= step.id 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'border-neutral-300 text-neutral-500'
              }
            `}>
              {step.icon}
            </div>
            <span className={`
              ml-2 text-sm font-medium
              ${currentStep >= step.id ? 'text-neutral-900' : 'text-neutral-600'}
            `}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4
                ${currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        {renderCurrentStep()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex space-x-3">
          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {asset ? 'Update Asset' : 'Create Asset'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
