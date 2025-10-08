import { Search, User, Settings } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export const Header = ({ title, action }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-3 flex items-center justify-between gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
            <User size={16} />
            <span>Leonam Nagel</span>
          </button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {(title || action) && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
          {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  );
};
