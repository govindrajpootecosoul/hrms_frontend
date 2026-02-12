'use client';

import { forwardRef, useState, useId, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(({ 
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = useId();
  const dropdownRef = useRef(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  // Auto-scroll to top when dropdown opens to show all options
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Small delay to ensure DOM is rendered, then scroll to top
      setTimeout(() => {
        dropdownRef.current.scrollTop = 0;
      }, 10);
    }
  }, [isOpen]);

  const base = 'w-full px-4 py-3 rounded-xl focus:ring-2 transition-all duration-200 cursor-pointer text-left border border-neutral-300 bg-white text-neutral-900 focus:border-primary-300 focus:ring-primary-200';
  const selectClasses = `
    ${base}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const labelClasses = 'block text-sm font-medium text-neutral-700';

  const valueTextClass = selectedOption ? 'text-neutral-900' : 'text-neutral-400';

  const chevronClass = 'text-neutral-400';

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className={labelClasses}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={ref}
          id={selectId}
          type="button"
          disabled={disabled}
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          {...props}
        >
          <span className={`block truncate ${valueTextClass}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className={`w-4 h-4 ${chevronClass} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overscroll-contain"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
              WebkitOverflowScrolling: 'touch'
            }}
            onWheel={(e) => {
              // Stop propagation to prevent modal from scrolling
              // But allow the dropdown itself to scroll naturally (don't prevent default)
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {options.length === 0 ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 transition-colors ${
                    option.value === value ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
