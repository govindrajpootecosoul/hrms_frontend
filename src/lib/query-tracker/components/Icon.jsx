import React from 'react';

/**
 * Material Icon Component
 * @param {string} name - Icon name from Material Icons
 * @param {string} variant - 'outlined' (default) or 'rounded'
 * @param {string} className - Additional CSS classes
 * @param {number} size - Icon size (default: 24)
 */
const Icon = ({ name, variant = 'outlined', className = '', size = 24, ...props }) => {
  const fontClass = variant === 'rounded' ? 'material-symbols-rounded' : 'material-symbols-outlined';
  
  return (
    <span 
      className={`${fontClass} ${className}`}
      style={{ fontSize: size, ...props.style }}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;

