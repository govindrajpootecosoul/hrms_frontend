'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Link as LinkIcon, Calendar, ChevronDown } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import EmployeeSelect from '@/components/common/EmployeeSelect';
import { API_BASE_URL } from '@/lib/utils/constants';

const AssetForm = ({ 
  asset = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  onOpen,
  companyId: propCompanyId = null
}) => {
  const params = useParams();
  const companyId = propCompanyId || params?.companyId || 'default';
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    category: asset?.category || '',
    subcategory: asset?.subcategory || '',
    site: asset?.site || '',
    location: asset?.location || '',
    status: asset?.status || 'available',
    assignedTo: asset?.assignedTo || '',
    department: asset?.department || '',
    
    // Step 2: Specifications
    brand: asset?.brand || '',
    model: asset?.model || '',
    serialNumber: asset?.serialNumber || '',
    description: asset?.description || '',
    processor: asset?.processor || '',
    processorGeneration: asset?.processorGeneration || '',
    totalRAM: asset?.totalRAM || '',
    ram1Size: asset?.ram1Size || '',
    ram2Size: asset?.ram2Size || '',
    warrantyStart: asset?.warrantyStart || '',
    warrantyMonths: asset?.warrantyMonths || '',
    warrantyExpire: asset?.warrantyExpire || '',
    purchaseDate: asset?.purchaseDate || '',
    purchasePrice: asset?.purchasePrice || '',
    notes: asset?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [assetTagId, setAssetTagId] = useState(asset?.assetTag || '');
  const [selectOpen, setSelectOpen] = useState({});
  const [usersData, setUsersData] = useState([]);
  const [settingsCategories, setSettingsCategories] = useState([]);
  const [settingsLocations, setSettingsLocations] = useState([]);
  const isEditMode = !!asset;

  // Fetch users data for auto-filling department
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin-users`);
        const data = await response.json();
        if (data.success && data.users) {
          // Store users data for auto-fill department
          setUsersData(data.users.filter(user => user.active !== false));
        }
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    };
    fetchUsersData();
  }, []);

  // Function to load categories
  const loadCategories = async () => {
    try {
      const url = companyId 
        ? `/api/asset-tracker/settings/categories?companyId=${companyId}`
        : '/api/asset-tracker/settings/categories';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const categories = Array.isArray(data.data?.categories) ? data.data.categories : [];
        console.log('[AssetForm] Loaded categories:', categories.length, 'for companyId:', companyId);
        setSettingsCategories(categories);
      } else {
        console.error('[AssetForm] Failed to load categories:', data.error);
      }
    } catch (e) {
      console.error('[AssetForm] Error loading categories settings:', e);
    }
  };

  // Function to load locations
  const loadLocations = async () => {
    try {
      const url = companyId 
        ? `/api/asset-tracker/settings/locations?companyId=${companyId}`
        : '/api/asset-tracker/settings/locations';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        const locations = Array.isArray(data.data?.locations) ? data.data.locations : [];
        console.log('[AssetForm] Loaded locations:', locations.length, 'for companyId:', companyId);
        setSettingsLocations(locations);
      } else {
        console.error('[AssetForm] Failed to load locations:', data.error);
      }
    } catch (e) {
      console.error('[AssetForm] Error loading locations settings:', e);
    }
  };

  // Load settings-driven categories and locations on mount and when companyId changes
  useEffect(() => {
    loadCategories();
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Refresh when asset prop changes (form opened for editing or new asset)
  useEffect(() => {
    // Refresh data when form opens to get latest categories/locations
    loadCategories();
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  // Listen for settings updates (real-time refresh)
  useEffect(() => {
    const handleCategoriesUpdate = () => {
      console.log('[AssetForm] Categories updated, refreshing...');
      loadCategories();
    };

    const handleLocationsUpdate = () => {
      console.log('[AssetForm] Locations updated, refreshing...');
      loadLocations();
    };

    // Listen for custom events when settings are saved
    window.addEventListener('asset-settings-categories-updated', handleCategoriesUpdate);
    window.addEventListener('asset-settings-locations-updated', handleLocationsUpdate);

    return () => {
      window.removeEventListener('asset-settings-categories-updated', handleCategoriesUpdate);
      window.removeEventListener('asset-settings-locations-updated', handleLocationsUpdate);
    };
  }, []);

  const categoryMapping = useMemo(() => {
    // { [categoryName]: { [subcategoryName]: tagPrefix } }
    const mapping = {};
    settingsCategories.forEach((cat) => {
      mapping[cat.name] = {};
      (cat.subcategories || []).forEach((sub) => {
        mapping[cat.name][sub.name] = sub.tagPrefix;
      });
    });
    return mapping;
  }, [settingsCategories]);

  const categoryOptions = useMemo(() => {
    return [
      { value: '', label: 'Select Category' },
      ...settingsCategories.map((c) => ({ value: c.name, label: c.name })),
    ];
  }, [settingsCategories]);

  const getSubcategoryOptions = () => {
    if (!formData.category) return [{ value: '', label: 'Select Sub Category' }];
    const subcategories = categoryMapping[formData.category];
    if (!subcategories) return [{ value: '', label: 'Select Sub Category' }];
    return [
      { value: '', label: 'Select Sub Category' },
      ...Object.keys(subcategories).map(sub => ({
        value: sub,
        label: sub,
      })),
    ];
  };

  const siteOptions = useMemo(() => {
    const sites = settingsLocations.filter((l) => l.type === 'Site');
    return [{ value: '', label: 'Select Site' }, ...sites.map((s) => ({ value: s.name, label: s.name }))];
  }, [settingsLocations]);

  const locationOptions = useMemo(() => {
    const locs = settingsLocations.filter((l) => l.type === 'Location');
    return [{ value: '', label: 'Select Location' }, ...locs.map((l) => ({ value: l.name, label: l.name }))];
  }, [settingsLocations]);

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'broken', label: 'Broken' },
  ];

  // Generate Asset Tag ID when category and subcategory are selected (only for new assets)
  useEffect(() => {
    if (!isEditMode && formData.category && formData.subcategory) {
      const prefix = categoryMapping[formData.category]?.[formData.subcategory];
      if (prefix) {
        // Generate a random 3-digit number
        const randomNum = Math.floor(Math.random() * 900) + 100;
        setAssetTagId(`${prefix}-${randomNum}`);
      } else {
        setAssetTagId('');
      }
    }
  }, [formData.category, formData.subcategory, isEditMode]);

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

    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        subcategory: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.subcategory) newErrors.subcategory = 'Sub Category is required';
        if (!formData.site) newErrors.site = 'Site is required';
        if (!formData.location) newErrors.location = 'Location is required';
        break;
      case 2:
        if (!formData.brand) newErrors.brand = 'Brand is required';
        if (!formData.model) newErrors.model = 'Model is required';
        if (!formData.serialNumber) newErrors.serialNumber = 'Serial Number is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit({
        ...formData,
        assetTag: isEditMode ? (asset?.assetTag || assetTagId) : assetTagId,
        ...(isEditMode ? { updatedAt: new Date().toISOString() } : { 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
    }
  };

  const toggleSelect = (field) => {
    setSelectOpen(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const closeAllSelects = () => {
    setSelectOpen({});
  };

  const renderStep1 = () => {
    const getSelectOptions = (field) => {
      switch (field) {
        case 'category':
          return categoryOptions;
        case 'subcategory':
          return getSubcategoryOptions();
        case 'site':
          return siteOptions;
        case 'location':
          return locationOptions;
        case 'status':
          return statusOptions;
        default:
          return [];
      }
    };

    const getSelectValue = (field) => {
      return formData[field] || '';
    };

    const renderCompactSelect = (field, label, required = false) => {
      const options = getSelectOptions(field);
      const value = getSelectValue(field);
      const selectedOption = options.find(opt => opt.value === value);
      const isOpen = selectOpen[field] || false;

      return (
        <div className="space-y-1 relative">
          <label className="block text-xs font-medium text-neutral-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                closeAllSelects();
                toggleSelect(field);
              }}
              disabled={field === 'subcategory' && !formData.category}
              className={`w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 bg-white text-left flex items-center justify-between ${
                errors[field] ? 'border-red-500' : ''
              } ${field === 'subcategory' && !formData.category ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-400'}`}
            >
              <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
                {selectedOption ? selectedOption.label : options[0]?.label || 'Select...'}
              </span>
              <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <>
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        handleChange(field, option.value);
                        setSelectOpen(prev => ({ ...prev, [field]: false }));
                      }}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-100 transition-colors ${
                        option.value === value ? 'bg-blue-50 text-blue-700' : 'text-neutral-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSelectOpen(prev => ({ ...prev, [field]: false }))}
                />
              </>
            )}
          </div>
          {errors[field] && <p className="text-xs text-red-600">{errors[field]}</p>}
        </div>
      );
    };

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderCompactSelect('category', 'Category', true)}
          {renderCompactSelect('subcategory', 'Sub Category', true)}
          
          {/* Generated Asset Tag ID */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-medium text-neutral-700">
              Asset Tag ID
            </label>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <LinkIcon className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-mono text-blue-900">
                {isEditMode ? (asset?.assetTag || assetTagId) : (assetTagId || 'Select Category and Sub Category to generate')}
              </span>
            </div>
          </div>
          
          {renderCompactSelect('site', 'Site', true)}
          {renderCompactSelect('location', 'Location', true)}
          {renderCompactSelect('status', 'Status', false)}
          
          {/* Assigned To - Department auto-fetches in background */}
          <EmployeeSelect
            value={formData.assignedTo}
            onChange={(value) => {
              handleChange('assignedTo', value);
              // Auto-fill department when employee is selected (hidden field)
              if (value && usersData.length > 0) {
                const user = usersData.find(u => u.name === value);
                if (user && user.department) {
                  handleChange('department', user.department);
                  console.log(`[AssetForm] Auto-filled department: ${user.department} for employee: ${value}`);
                } else {
                  handleChange('department', '');
                }
              } else if (!value) {
                // Clear department when unassigning
                handleChange('department', '');
              }
            }}
            placeholder="Select Employee"
            showUnassigned={true}
            error={errors.assignedTo}
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const isComputerAsset = formData.category === 'Computer Assets';
    const isExternalEquipment = formData.category === 'External Equipment';

    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">
          {formData.category} Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              placeholder="e.g. Dell, HP, Apple"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            {errors.brand && <p className="text-xs text-red-600">{errors.brand}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g. Latitude 5520, EliteDesk 800"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            {errors.model && <p className="text-xs text-red-600">{errors.model}</p>}
          </div>
          
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-medium text-neutral-700">
              Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => handleChange('serialNumber', e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            {errors.serialNumber && <p className="text-xs text-red-600">{errors.serialNumber}</p>}
          </div>
          
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          
          {/* Computer Asset Specific Fields - Only show for Computer Assets */}
          {isComputerAsset && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-700">Processor</label>
                <input
                  type="text"
                  value={formData.processor}
                  onChange={(e) => handleChange('processor', e.target.value)}
                  placeholder="e.g. Intel Core i7"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-700">Processor Generation</label>
                <input
                  type="text"
                  value={formData.processorGeneration}
                  onChange={(e) => handleChange('processorGeneration', e.target.value)}
                  placeholder="e.g. 11th Gen"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-700">Total RAM</label>
                <input
                  type="text"
                  value={formData.totalRAM}
                  onChange={(e) => handleChange('totalRAM', e.target.value)}
                  placeholder="e.g. 16GB"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-700">RAM 1 Size</label>
                <input
                  type="text"
                  value={formData.ram1Size}
                  onChange={(e) => handleChange('ram1Size', e.target.value)}
                  placeholder="e.g. 8GB"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-medium text-neutral-700">RAM 2 Size</label>
                <input
                  type="text"
                  value={formData.ram2Size}
                  onChange={(e) => handleChange('ram2Size', e.target.value)}
                  placeholder="e.g. 8GB"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
            </>
          )}
          
          {/* Warranty Fields - Available for all categories */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Warranty Start</label>
            <div className="relative">
              <input
                type="date"
                value={formData.warrantyStart}
                onChange={(e) => handleChange('warrantyStart', e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full px-3 py-1.5 pr-8 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Warranty Months</label>
            <input
              type="text"
              value={formData.warrantyMonths}
              onChange={(e) => handleChange('warrantyMonths', e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Warranty Expire</label>
            <div className="relative">
              <input
                type="date"
                value={formData.warrantyExpire}
                onChange={(e) => handleChange('warrantyExpire', e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full px-3 py-1.5 pr-8 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          
          {/* Purchase Information - Available for all categories */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Purchase Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full px-3 py-1.5 pr-8 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
              <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Purchase Price</label>
            <input
              type="text"
              value={formData.purchasePrice}
              onChange={(e) => handleChange('purchasePrice', e.target.value)}
              placeholder="e.g. 1200.00"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>
          
          {/* Notes - Available for all categories */}
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-medium text-neutral-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes or comments"
              rows={3}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 h-1 rounded-full transition-colors ${
          currentStep >= 1 ? 'bg-blue-600' : 'bg-neutral-200'
        }`} />
        <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          currentStep === 1 
            ? 'bg-blue-600 text-white' 
            : currentStep > 1 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-neutral-100 text-neutral-500'
        }`}>
          1 Basic Information
        </div>
        <div className={`flex-1 h-1 rounded-full transition-colors ${
          currentStep >= 2 ? 'bg-blue-600' : 'bg-neutral-200'
        }`} />
        <div className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          currentStep === 2 
            ? 'bg-blue-600 text-white' 
            : currentStep > 2 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-neutral-100 text-neutral-500'
        }`}>
          2 Detailed Specifications
        </div>
        <div className={`flex-1 h-1 rounded-full transition-colors ${
          currentStep >= 2 ? 'bg-blue-600' : 'bg-neutral-200'
        }`} />
      </div>

      {/* Form Content */}
      <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Button
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>
        
        <div className="flex gap-3">
          {currentStep === 1 && (
            <Button
              onClick={handleNext}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Next Step
            </Button>
          )}
          {currentStep === 2 && (
            <>
              <Button
                onClick={onCancel}
                className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isEditMode ? 'Update Asset' : 'Add Asset'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
