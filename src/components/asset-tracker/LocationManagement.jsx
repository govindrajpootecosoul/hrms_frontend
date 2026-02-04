'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Edit, MapPin, Building2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';

const LocationManagement = () => {
  const params = useParams();
  const companyId = params?.companyId;

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Site',
    address: '',
    country: '',
    parentSite: '',
  });

  const sites = locations.filter(loc => loc.type === 'Site');

  // Load locations from settings API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const url = companyId
          ? `/api/asset-tracker/settings/locations?companyId=${companyId}`
          : '/api/asset-tracker/settings/locations';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setLocations(Array.isArray(data.data?.locations) ? data.data.locations : []);
        }
      } catch (e) {
        console.error('Failed to load locations settings:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [companyId]);

  const saveLocations = async (nextLocations) => {
    const payload = { companyId: companyId || 'default', locations: nextLocations };
    const res = await fetch('/api/asset-tracker/settings/locations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save locations');
    
    // Dispatch event to notify other components (like AssetForm) to refresh
    window.dispatchEvent(new CustomEvent('asset-settings-locations-updated', {
      detail: { locations: nextLocations }
    }));
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      type: 'Site',
      address: '',
      country: '',
      parentSite: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      address: item.address || '',
      country: item.country || '',
      parentSite: item.parentSite || '',
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Name is required');
      return;
    }

    if (formData.type === 'Site' && !formData.address) {
      alert('Address is required for sites');
      return;
    }

    if (formData.type === 'Location' && !formData.parentSite) {
      alert('Parent site is required for locations');
      return;
    }

    const next = editingItem
      ? locations.map((loc) => (loc.id === editingItem.id ? { ...loc, ...formData } : loc))
      : [...locations, { id: Date.now().toString(), ...formData }];

    setLocations(next);
    saveLocations(next).catch((e) => console.error('Failed to save locations:', e));
    setShowEditModal(false);
    setShowAddModal(false);

    setFormData({
      name: '',
      type: 'Site',
      address: '',
      country: '',
      parentSite: '',
    });
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    const item = locations.find(loc => loc.id === id);
    if (confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      const next = locations.filter((loc) => loc.id !== id);
      setLocations(next);
      saveLocations(next).catch((e) => console.error('Failed to save locations:', e));
    }
  };

  const sitesList = locations.filter(loc => loc.type === 'Site');
  const locationsList = locations.filter(loc => loc.type === 'Location');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">Locations & Sites</h2>
          <p className="text-xs text-neutral-600">Manage physical locations and sites for asset tracking</p>
        </div>
        <Button
          onClick={handleAdd}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
        >
          Add Location
        </Button>
      </div>

      {/* Sites Section */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Sites</h3>
          <span className="text-xs text-neutral-500">({sitesList.length})</span>
        </div>
        <div className="space-y-2">
          {loading && <p className="text-xs text-neutral-500 text-center py-2">Loading...</p>}
          {sitesList.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">No sites added yet</p>
          ) : (
            sitesList.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-neutral-900">{site.name}</div>
                    {site.address && (
                      <div className="text-xs text-neutral-500 truncate">{site.address}</div>
                    )}
                    {site.country && (
                      <div className="text-xs text-neutral-500">{site.country}</div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-neutral-700 flex-shrink-0">
                    {site.assetCount} assets
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEdit(site)}
                    className="w-6 h-6 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center transition-colors"
                    title="Edit Site"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="w-6 h-6 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded flex items-center justify-center transition-colors"
                    title="Delete Site"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Locations Section */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Locations</h3>
          <span className="text-xs text-neutral-500">({locationsList.length})</span>
        </div>
        <div className="space-y-2">
          {loading && <p className="text-xs text-neutral-500 text-center py-2">Loading...</p>}
          {locationsList.length === 0 ? (
            <p className="text-xs text-neutral-500 text-center py-4">No locations added yet</p>
          ) : (
            locationsList.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg border border-neutral-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-neutral-900">{location.name}</div>
                    {location.parentSite && (
                      <div className="text-xs text-neutral-500">Site: {location.parentSite}</div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-neutral-700 flex-shrink-0">
                    {location.assetCount} assets
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => handleEdit(location)}
                    className="w-6 h-6 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center transition-colors"
                    title="Edit Location"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="w-6 h-6 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded flex items-center justify-center transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingItem(null);
          setFormData({
            name: '',
            type: 'Site',
            address: '',
            country: '',
            parentSite: '',
          });
        }}
        title={editingItem ? 'Edit Location' : 'Add New Location'}
        size="md"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, parentSite: e.target.value === 'Site' ? '' : prev.parentSite }))}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            >
              <option value="Site">Site</option>
              <option value="Location">Location</option>
            </select>
          </div>

          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={formData.type === 'Site' ? 'e.g. Head Office' : 'e.g. Floor 1'}
            required
          />

          {formData.type === 'Site' ? (
            <>
              <Input
                label="Address *"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. 123 Main Street, City, State ZIP"
                required
              />
              <Input
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="e.g. USA"
              />
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Parent Site <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.parentSite}
                onChange={(e) => setFormData(prev => ({ ...prev, parentSite: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              >
                <option value="">Select a site</option>
                {sites.map(site => (
                  <option key={site.id} value={site.name}>{site.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setEditingItem(null);
                setFormData({
                  name: '',
                  type: 'Site',
                  address: '',
                  country: '',
                  parentSite: '',
                });
              }}
              className="bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
            >
              {editingItem ? 'Update' : 'Add'} Location
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LocationManagement;

