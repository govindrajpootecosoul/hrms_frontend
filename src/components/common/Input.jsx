'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  variant = 'glass', // default | glass
  ...props
}, ref) => {
  const inputId = useId();
  
  const base = 'w-full px-4 py-3 rounded-xl focus:ring-2 transition-all duration-200';
  const variants = {
    default: 'border border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-primary-500',
    glass: 'border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-300 focus:ring-primary-200'
  };
  const errorRing = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
  const paddingIconLeft = icon && iconPosition === 'left' ? 'pl-12' : '';
  const paddingIconRight = icon && iconPosition === 'right' ? 'pr-12' : '';
  const inputClasses = `
    ${base} ${variants[variant] || variants.default} ${errorRing} ${disabledStyles} ${paddingIconLeft} ${paddingIconRight} ${className}
  `.trim();

  const labelClasses = 'block text-sm font-medium text-neutral-700';

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className={labelClasses}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400 w-4 h-4">
              {icon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-400 w-4 h-4">
              {icon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
