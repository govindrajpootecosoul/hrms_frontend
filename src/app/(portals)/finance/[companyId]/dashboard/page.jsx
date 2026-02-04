'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Receipt, 
  BookOpen, 
  Calculator, 
  FileCheck, 
  Merge,
  FolderOpen,
  File,
  ArrowLeft,
  PackageSearch,
  Warehouse
} from 'lucide-react';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import FileFolderSelector from '@/components/finance/FileFolderSelector';

const FinanceDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId;
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const handleBack = () => {
    router.push('/select-portal');
  };

  // Finance features data - Only implemented features
  const initialFinanceFeatures = [
    {
      id: 'amazon-tax-invoice',
      title: 'Amazon Tax Invoice',
      description: 'Process and manage Amazon tax invoices efficiently',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      enabled: true
    },
    {
      id: 'amazon-credit-note',
      title: 'Amazon Credit Note',
      description: 'Handle Amazon credit notes and adjustments',
      icon: <Receipt className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      enabled: true
    },
    {
      id: 'book-reconcile',
      title: 'Book Reconcile',
      description: 'Reconcile your books and financial records',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      enabled: false
    },
    {
      id: 'gst-reconcile',
      title: 'Channel/Platform GST Reconcile',
      description: 'Reconcile your Amazon, Jio, Retail GST files with multi-file merger',
      icon: <Calculator className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      enabled: true
    },
    {
      id: 'amazon-gst-process',
      title: 'GST File Processing & Merging',
      description: 'Process GST file for B2B, B2BA,B2B-CDNR,IMPG, & B2B-CDNRA and merge into single file',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      enabled: true
    },
    {
      id: 'amazon-missing-shipment',
      title: 'Amazon Missing Shipment',
      description: 'Find missing Shipment IDs by comparing main_data CSV with country-specific Excel files',
      icon: <PackageSearch className="w-8 h-8" />,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      enabled: true
    },
    {
      id: 'meir',
      title: 'MEIR',
      description: 'Month End Inventory Reconciliation',
      icon: <Warehouse className="w-8 h-8" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      enabled: true
    },
    {
      id: 'books-vs-gst-reconciliation',
      title: 'Books vs GST Reconciliation',
      description: 'Compare and reconcile books with GST records',
      icon: <FileCheck className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      enabled: false
    },
    {
      id: 'amazon-pdf-merger',
      title: 'Amazon PDF Merger',
      description: 'Merge multiple Amazon PDF documents',
      icon: <Merge className="w-8 h-8" />,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      enabled: false
    }
  ];

  const [financeFeatures, setFinanceFeatures] = useState(initialFinanceFeatures);

  const handleCardClick = (feature) => {
    if (!feature.enabled) {
      alert(`Coming Soon!\n\n${feature.title} feature is currently under development and will be available soon.`);
      return;
    }
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeature(null);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setFinanceFeatures((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(null);
  };

  const getApiEndpoint = (featureId) => {
    if (featureId === 'amazon-tax-invoice') {
      return '/api/finance/amazon-tax-invoice/process';
    } else if (featureId === 'amazon-credit-note') {
      return '/api/finance/amazon-credit-note/process';
    } else if (featureId === 'gst-reconcile') {
      return '/api/finance/gst-reconcile/process';
    } else if (featureId === 'amazon-gst-process') {
      return '/api/finance/amazon-gst-process/process';
    } else if (featureId === 'amazon-missing-shipment') {
      return '/api/finance/amazon-missing-shipment/process';
    } else if (featureId === 'meir') {
      return '/api/finance/meir/process';
    }
    return '/api/finance/amazon-tax-invoice/process'; // default
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button Icon - Top Left */}
        <button
          onClick={handleBack}
          className="mb-6 p-2 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 shadow-sm transition-colors"
          aria-label="Back to Main Screen"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Tools
          </h1>
          <p className="text-neutral-600">
            Manage your financial operations and processes
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeFeatures.map((feature, index) => (
            <Card
              key={feature.id}
              className={`${
                feature.enabled 
                  ? 'cursor-pointer hover:scale-105 transition-transform duration-300 group' 
                  : 'opacity-60 cursor-not-allowed'
              } overflow-hidden relative`}
              onClick={() => handleCardClick(feature)}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              {!feature.enabled && (
                <div className="absolute top-2 right-2 bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-1 rounded">
                  Coming Soon
                </div>
              )}
              
              <div className={`${feature.bgColor} rounded-lg p-4 mb-4 flex items-center justify-center ${
                feature.enabled ? 'group-hover:scale-110 transition-transform duration-300' : ''
              }`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              
              <h3 className={`text-xl font-semibold mb-2 ${
                feature.enabled 
                  ? 'text-neutral-900 group-hover:text-primary-600 transition-colors' 
                  : 'text-neutral-600'
              }`}>
                {feature.title}
              </h3>
              
              <p className="text-sm text-neutral-600 mb-4">
                {feature.description}
              </p>
              
              {feature.enabled ? (
                <div className="flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Get Started</span>
                  <svg 
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center text-neutral-400 text-sm font-medium">
                  <span>Under Development</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFeature?.title}
        size="lg"
      >
        {selectedFeature && (
          <FileFolderSelector 
            feature={selectedFeature} 
            onClose={handleCloseModal}
            apiEndpoint={getApiEndpoint(selectedFeature.id)}
          />
        )}
      </Modal>
    </div>
  );
};

export default FinanceDashboard;

