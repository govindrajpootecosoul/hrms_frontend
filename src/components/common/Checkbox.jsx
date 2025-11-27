'use client';

import { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(({ 
  label,
  checked = false,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const checkboxId = useId();
  
  const base = 'w-5 h-5 rounded-md border-2 transition-all duration-200 cursor-pointer flex items-center justify-center';
  const checkedStyles = checked 
    ? 'bg-primary-600 border-primary-600 text-white' 
    : 'bg-white border-neutral-300 hover:border-primary-400';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const errorStyles = error ? 'border-red-500' : '';
  
  const checkboxClasses = `${base} ${checkedStyles} ${disabledStyles} ${errorStyles} ${className}`.trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="relative">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={checkboxClasses}
          >
            {checked && <Check className="w-3.5 h-3.5" />}
          </label>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={`ml-3 text-sm font-medium text-neutral-700 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
          >
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <div className="ml-8 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

