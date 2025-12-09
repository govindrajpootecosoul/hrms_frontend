'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  Receipt, 
  BookOpen, 
  Calculator, 
  FileCheck, 
  Merge,
  FolderOpen,
  File
} from 'lucide-react';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const FinanceDashboard = () => {
  const params = useParams();
  const companyId = params.companyId;
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Finance features data
  const financeFeatures = [
    {
      id: 'amazon-tax-invoice',
      title: 'Amazon Tax Invoice',
      description: 'Process and manage Amazon tax invoices efficiently',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'amazon-credit-note',
      title: 'Amazon Credit Note',
      description: 'Handle Amazon credit notes and adjustments',
      icon: <Receipt className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'book-reconcile',
      title: 'Book Reconcile',
      description: 'Reconcile your books and financial records',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'gst-reconcile',
      title: 'GST Reconcile',
      description: 'Reconcile GST returns and filings',
      icon: <Calculator className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      id: 'books-vs-gst-reconciliation',
      title: 'Books vs GST Reconciliation',
      description: 'Compare and reconcile books with GST records',
      icon: <FileCheck className="w-8 h-8" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'amazon-pdf-merger',
      title: 'Amazon PDF Merger',
      description: 'Merge multiple Amazon PDF documents',
      icon: <Merge className="w-8 h-8" />,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    }
  ];

  const handleCardClick = (feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleProcessFolder = () => {
    // Handle process folder action
    console.log('Process folder for:', selectedFeature?.title);
    // Add your logic here
    setIsModalOpen(false);
  };

  const handleProcessFile = () => {
    // Handle process file action
    console.log('Process file for:', selectedFeature?.title);
    // Add your logic here
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Finance Portal
          </h1>
          <p className="text-neutral-600">
            Manage your financial operations and processes
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeFeatures.map((feature) => (
            <Card
              key={feature.id}
              className="cursor-pointer hover:scale-105 transition-transform duration-300 group overflow-hidden"
              onClick={() => handleCardClick(feature)}
            >
              <div className={`${feature.bgColor} rounded-lg p-4 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-sm text-neutral-600 mb-4">
                {feature.description}
              </p>
              
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
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFeature?.title}
        size="md"
      >
        <div className="space-y-6">
          {/* Feature Icon and Message */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`${selectedFeature?.bgColor} rounded-full p-4 mb-4`}>
              <div className={selectedFeature?.iconColor}>
                {selectedFeature?.icon}
              </div>
            </div>
            <p className="text-lg font-medium text-neutral-700 text-center">
              {selectedFeature?.title}
            </p>
            <p className="text-sm text-neutral-500 text-center mt-2">
              {selectedFeature?.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleProcessFolder}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-base font-semibold"
              icon={<FolderOpen className="w-5 h-5" />}
            >
              Process Folder
            </Button>
            
            <Button
              onClick={handleProcessFile}
              className="w-full bg-secondary-600 hover:bg-secondary-700 text-white py-3 text-base font-semibold"
              icon={<File className="w-5 h-5" />}
            >
              Process a File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceDashboard;

