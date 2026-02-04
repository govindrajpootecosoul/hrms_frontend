'use client';

const Textarea = ({ 
  value, 
  onChange, 
  placeholder = '', 
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      {...props}
    />
  );
};

export default Textarea;

