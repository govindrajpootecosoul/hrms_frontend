'use client';

import { useRouter, usePathname } from 'next/navigation';

export function FloatingActionButton() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', path: '/admin-portal/dashboard', icon: '📊' },
    { label: 'User Manager', path: '/admin-portal/users', icon: '👥' },
    { label: 'Portal Manager', path: '/admin-portal/portals', icon: '🔧' },
  ];

  const handleItemClick = (path) => {
    router.push(path);
  };

  const isActive = (path) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl px-8 py-4">
        <div className="flex items-center justify-center space-x-8">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item.path)}
                className={`relative flex flex-col items-center justify-center px-6 py-2 rounded-lg transition-all duration-200 ${
                  active 
                    ? 'bg-orange-500' 
                    : 'hover:bg-gray-700'
                }`}
              >
                {/* Icon */}
                <span
                  className={`text-2xl mb-1 transition-all duration-200 ${
                    active ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {item.icon}
                </span>
                
                {/* Label */}
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    active
                      ? 'text-white'
                      : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}













