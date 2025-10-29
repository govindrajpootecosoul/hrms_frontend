'use client';

import { forwardRef, useState, useId } from 'react';
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
  variant = 'glass', // default | glass
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = useId();
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  const base = 'w-full px-4 py-3 rounded-xl focus:ring-2 transition-all duration-200 cursor-pointer text-left';
  const variants = {
    default: 'border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-primary-500',
    glass: 'border border-white/30 bg-transparent text-white focus:border-white/60 focus:ring-white/40'
  };
  const selectClasses = `
    ${base} ${variants[variant] || variants.default}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const labelClasses = variant === 'glass'
    ? 'block text-sm font-medium text-white'
    : 'block text-sm font-medium text-neutral-700';

  const valueTextClass = selectedOption
    ? (variant === 'glass' ? 'text-white' : 'text-neutral-900')
    : 'text-neutral-400';

  const chevronClass = variant === 'glass' ? 'text-white/70' : 'text-neutral-400';

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
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-auto">
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
                  onClick={() => handleSelect(option.value)}
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
