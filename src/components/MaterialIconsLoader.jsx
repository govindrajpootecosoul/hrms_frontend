'use client';

import { useEffect } from 'react';

export default function MaterialIconsLoader() {
  useEffect(() => {
    // Check if links already exist
    const existingOutlined = document.querySelector('link[href*="Material+Symbols+Outlined"]');
    const existingRounded = document.querySelector('link[href*="Material+Symbols+Rounded"]');

    if (!existingOutlined) {
      const linkOutlined = document.createElement('link');
      linkOutlined.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      linkOutlined.rel = 'stylesheet';
      document.head.appendChild(linkOutlined);
    }

    if (!existingRounded) {
      const linkRounded = document.createElement('link');
      linkRounded.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      linkRounded.rel = 'stylesheet';
      document.head.appendChild(linkRounded);
    }
  }, []);

  return null;
}

