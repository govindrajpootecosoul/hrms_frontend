'use client';

import { forwardRef } from 'react';
import Silk from '@/components/common/SilkBackground';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';
import Skeleton from './Skeleton';

const Table = forwardRef(({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  actions,
  pagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  ...props
}, ref) => {
  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handlePageChange = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-white/20 ${className}`}>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Silk speed={3} scale={1} color="#7B7481" noiseIntensity={1.2} rotation={0.2} />
        </div>
        <div className="bg-white/5 p-4">
          <div className="flex gap-4">
            {columns.map((_, i) => (
              <Skeleton key={i} height="1rem" width="25%" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-white/10 last:border-b-0">
            <div className="flex gap-4">
              {columns.map((_, colIndex) => (
                <Skeleton key={colIndex} height="1rem" width="25%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
        <div className={`relative overflow-hidden rounded-xl border border-white/20 shadow-sm ${className}`} {...props}>
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Silk speed={3} scale={1} color="#7B7481" noiseIntensity={1.2} rotation={0.2} />
      </div>
      <div className="overflow-x-auto relative z-10">
        <table ref={ref} className="w-full border-collapse">
              <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white/5 divide-y divide-white/10">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-12 text-center text-white/60"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={`border-b border-white/10 hover:bg-white/10 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => handleRowClick(row, index)}
                    >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-white"
                    >
                      {column.render ? column.render(row[column.key], row, index) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative z-10">
                      <div className="flex items-center justify-end space-x-2 text-white/80">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row, index);
                            }}
                            className={`text-white/60 hover:text-white transition-colors ${
                              action.variant === 'danger' ? 'hover:text-danger-400' : ''
                            }`}
                            title={action.title}
                          >
                            {action.icon || <MoreHorizontal className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white/5 px-6 py-3 border-t border-white/10 flex items-center justify-between text-white">
          <div className="text-sm text-white/80">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
