
import React from 'react';

export const SidebarLoading: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Goco ERP</h1>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        <div className="animate-pulse space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
