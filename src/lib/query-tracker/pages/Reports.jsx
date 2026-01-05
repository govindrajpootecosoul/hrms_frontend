'use client';

import React, { useState } from 'react';
import api from '../utils/api';
import Icon from '../components/Icon';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({ type: '', format: '' });

  const reportTypes = [
    { id: 'all', label: 'All Queries List', icon: 'bar_chart' },
    { id: 'my', label: 'My Queries List', icon: 'assignment' },
    { id: 'open', label: 'Open Query List', icon: 'folder_open' },
    { id: 'closed', label: 'Closed Query List', icon: 'folder' },
    { id: 'in-progress', label: 'In Progress Query List', icon: 'pending' }
  ];

  const fileTypes = [
    { 
      id: 'excel', 
      label: 'Excel', 
      icon: 'table_chart',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      textColor: 'text-white',
      borderColor: 'border-emerald-500'
    },
    { 
      id: 'pdf', 
      label: 'PDF', 
      icon: 'picture_as_pdf',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-500'
    },
    { 
      id: 'csv', 
      label: 'CSV', 
      icon: 'table_view',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      textColor: 'text-white',
      borderColor: 'border-blue-500'
    }
  ];

  const handleDownload = async (type, format) => {
    setDownloading({ type, format });
    setLoading(true);
    try {
      const response = await api.get(`/reports/${type}/${format}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_queries_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      if (typeof window !== 'undefined') {
        alert('Error downloading report');
      }
    } finally {
      setLoading(false);
      setDownloading({ type: '', format: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Reports
        </h1>
        <p className="text-gray-500 text-sm">Download queries in various formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white/75 backdrop-blur-lg p-6 rounded-2xl hover:shadow-xl transition-all shadow-lg border border-white/50">
            {/* Category Header */}
            <div className="flex items-center space-x-3 mb-6">
              <Icon name={report.icon} size={24} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-600">{report.label}</h2>
            </div>

            {/* Download Options - Single Row */}
            <div className="flex gap-2">
              {fileTypes.map((fileType) => {
                const isDownloading = loading && downloading.type === report.id && downloading.format === fileType.id;
                return (
                  <button
                    key={fileType.id}
                    onClick={() => handleDownload(report.id, fileType.id)}
                    disabled={loading}
                    className={`
                      flex-1 flex items-center justify-center space-x-1.5
                      ${fileType.color} ${fileType.hoverColor} ${fileType.textColor}
                      px-3 py-2.5 rounded-lg
                      font-medium text-sm
                      transition-all transform hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                      shadow-sm hover:shadow-md
                      border ${fileType.borderColor}
                    `}
                  >
                    {isDownloading ? (
                      <>
                        <Icon name="hourglass_empty" size={16} className="animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <>
                        <Icon name={fileType.icon} size={18} />
                        <span>{fileType.label}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/75 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-700 mt-4 text-center font-medium">Generating report...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

