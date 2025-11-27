'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import Navbar from '@/components/layout/Navbar';
import Sidebar, { ASSET_TRACKER_MENU_ITEMS } from '@/components/layout/Sidebar';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Card from '@/components/common/Card';

const LocationsSettingsPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [locations, setLocations] = useState([
    {
      id: 'office-1',
      name: 'Office Building 1',
      address: '123 Main Street, Downtown, City 12345',
      sites: [
        { id: 'floor-1', name: 'Floor 1', locationId: 'office-1' },
        { id: 'floor-2', name: 'Floor 2', locationId: 'office-1' },
        { id: 'floor-3', name: 'Floor 3', locationId: 'office-1' }
      ]
    },
    {
      id: 'office-2',
      name: 'Office Building 2',
      address: '456 Business Ave, Uptown, City 12345',
      sites: [
        { id: 'floor-1-b2', name: 'Floor 1', locationId: 'office-2' },
        { id: 'floor-2-b2', name: 'Floor 2', locationId: 'office-2' }
      ]
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      address: '789 Industrial Blvd, Industrial Zone, City 12345',
      sites: [
        { id: 'loading-dock', name: 'Loading Dock', locationId: 'warehouse' },
        { id: 'storage-area', name: 'Storage Area', locationId: 'warehouse' }
      ]
    }
  ]);

  const [locationForm, setLocationForm] = useState({
    name: '',
    address: ''
  });

  const [siteForm, setSiteForm] = useState({
    name: ''
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddLocation = () => {
    setLocationForm({ name: '', address: '' });
    setSelectedLocation(null);
    setShowAddLocation(true);
  };

  const handleAddSite = (location) => {
    setSelectedLocation(location);
    setSiteForm({ name: '' });
    setSelectedSite(null);
    setShowAddSite(true);
  };

  const handleEditLocation = (location) => {
    setLocationForm({ name: location.name, address: location.address });
    setSelectedLocation(location);
    setShowAddLocation(true);
  };

  const handleEditSite = (location, site) => {
    setSelectedLocation(location);
    setSiteForm({ name: site.name });
    setSelectedSite(site);
    setShowAddSite(true);
  };

  const handleDeleteLocation = (location) => {
    if (confirm(`Are you sure you want to delete ${location.name}? This will also delete all sites.`)) {
      setLocations(prev => prev.filter(loc => loc.id !== location.id));
      toast.success(`${location.name} has been deleted successfully`);
    }
  };

  const handleDeleteSite = (location, site) => {
    if (confirm(`Are you sure you want to delete ${site.name}?`)) {
      setLocations(prev => prev.map(loc => 
        loc.id === location.id 
          ? { ...loc, sites: loc.sites.filter(s => s.id !== site.id) }
          : loc
      ));
      toast.success(`${site.name} has been deleted successfully`);
    }
  };

  const handleSubmitLocation = () => {
    if (selectedLocation) {
      // Update existing location
      setLocations(prev => prev.map(loc => 
        loc.id === selectedLocation.id 
          ? { ...loc, name: locationForm.name, address: locationForm.address }
          : loc
      ));
      toast.success('Location updated successfully');
    } else {
      // Add new location
      const newLocation = {
        id: locationForm.name.toLowerCase().replace(/\s+/g, '-'),
        name: locationForm.name,
        address: locationForm.address,
        sites: []
      };
      setLocations(prev => [...prev, newLocation]);
      toast.success('Location added successfully');
    }
    
    setShowAddLocation(false);
    setSelectedLocation(null);
  };

  const handleSubmitSite = () => {
    if (selectedLocation) {
      if (selectedSite) {
        // Update existing site
        setLocations(prev => prev.map(loc => 
          loc.id === selectedLocation.id 
            ? { 
                ...loc, 
                sites: loc.sites.map(site => 
                  site.id === selectedSite.id 
                    ? { ...site, name: siteForm.name }
                    : site
                )
              }
            : loc
        ));
        toast.success('Site updated successfully');
      } else {
        // Add new site
        setLocations(prev => prev.map(loc => 
          loc.id === selectedLocation.id 
            ? { 
                ...loc, 
                sites: [
                  ...loc.sites,
                  {
                    id: `${selectedLocation.id}-${siteForm.name.toLowerCase().replace(/\s+/g, '-')}`,
                    name: siteForm.name,
                    locationId: selectedLocation.id
                  }
                ]
              }
            : loc
        ));
        toast.success('Site added successfully');
      }
    }
    
    setShowAddSite(false);
    setSelectedLocation(null);
    setSelectedSite(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
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
                title="Location Management"
                description="Manage locations and sites for asset tracking"
                actions={[
                  <Button
                    key="add-location"
                    onClick={handleAddLocation}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Location
                  </Button>
                ]}
              />

              {/* Locations and Sites */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Locations */}
                <Card title="Locations">
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <div key={location.id} className="border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-primary-600 mr-3 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-neutral-900 mb-1">
                                {location.name}
                              </h3>
                              <p className="text-sm text-neutral-600 mb-2">
                                {location.address}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {location.sites.length} site(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddSite(location)}
                              icon={<Plus className="w-4 h-4" />}
                            >
                              Add Site
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleEditLocation(location)}
                              icon={<Edit className="w-4 h-4" />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteLocation(location)}
                              icon={<Trash2 className="w-4 h-4" />}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {locations.length === 0 && (
                      <p className="text-center text-neutral-500 py-8">
                        No locations found. Add your first location to get started.
                      </p>
                    )}
                  </div>
                </Card>

                {/* Sites */}
                <Card title="Sites">
                  <div className="space-y-4">
                    {locations.flatMap(location => 
                      location.sites.map(site => (
                        <div key={site.id} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Building className="w-5 h-5 text-secondary-600 mr-3" />
                              <div>
                                <h4 className="font-medium text-neutral-900">{site.name}</h4>
                                <p className="text-sm text-neutral-600">{location.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditSite(location, site)}
                                icon={<Edit className="w-4 h-4" />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteSite(location, site)}
                                icon={<Trash2 className="w-4 h-4" />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {locations.every(loc => loc.sites.length === 0) && (
                      <p className="text-center text-neutral-500 py-8">
                        No sites found. Add sites to locations to get started.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Location Modal */}
      <Modal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
        title={selectedLocation ? 'Edit Location' : 'Add Location'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Location Name"
            value={locationForm.name}
            onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Address
            </label>
            <textarea
              value={locationForm.address}
              onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={() => setShowAddLocation(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitLocation}>
              {selectedLocation ? 'Update Location' : 'Add Location'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Site Modal */}
      <Modal
        isOpen={showAddSite}
        onClose={() => setShowAddSite(false)}
        title={selectedSite ? 'Edit Site' : 'Add Site'}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600">
              {selectedSite ? 'Editing site in:' : 'Adding site to:'} <strong>{selectedLocation?.name}</strong>
            </p>
          </div>
          
          <Input
            label="Site Name"
            value={siteForm.name}
            onChange={(e) => setSiteForm(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              onClick={() => setShowAddSite(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitSite}>
              {selectedSite ? 'Update Site' : 'Add Site'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LocationsSettingsPage;
