import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-2 flex items-center">
      <div className="flex items-center justify-start space-x-3">
        <div className="w-4 h-4 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Wingman Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xs font-medium text-gray-700">Wingman AI</span>
        <span className="text-xs text-gray-500">@copyright reserved</span>
      </div>
    </footer>
  );
}
