'use client';

import { useState, useRef, useEffect } from 'react';

export function AdminMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  emptyMessage = 'No options available.',
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = (Array.isArray(options) ? options : []).map((opt) => {
    if (opt && typeof opt === 'object') {
      const value = opt.value ?? opt.id ?? opt.key;
      return {
        value: String(value ?? ''),
        label: String(opt.label ?? opt.name ?? value ?? ''),
      };
    }
    return { value: String(opt ?? ''), label: String(opt ?? '') };
  }).filter((o) => o.value !== '');

  const selectedValues = Array.isArray(selected) ? selected.map((x) => String(x)) : [];
  const selectedLabels = selectedValues
    .map((v) => normalizedOptions.find((o) => o.value === v)?.label || v)
    .filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} selected`}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</div>
          ) : (
            normalizedOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900">{option.label}</span>
              </label>
            ))
          )}
        </div>
      )}
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {selectedLabels.find((l) => l === (normalizedOptions.find((o) => o.value === item)?.label || item)) ||
                normalizedOptions.find((o) => o.value === item)?.label ||
                item}
              <button
                type="button"
                onClick={() => toggleOption(String(item))}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
              >
                <span className="sr-only">Remove</span>
                <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6l-6 6" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}











































