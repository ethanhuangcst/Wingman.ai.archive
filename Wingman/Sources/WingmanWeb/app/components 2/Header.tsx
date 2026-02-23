import React from 'react';

interface HeaderProps {
  user: {
    name: string;
    profileImage?: string | null;
  };
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-6 pt-0 pb-1.5 flex items-center justify-between">
      {/* Left: Logo and App Name */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8">
          <img 
            src="/logo.png" 
            alt="Wingman Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Wingman</h1>
      </div>

      {/* Right: User Info and Logout */}
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium">
          Hello <a href="/settings" className="text-blue-600 hover:underline">{user.name}</a>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-xs">{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
