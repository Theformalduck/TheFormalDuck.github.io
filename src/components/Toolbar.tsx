import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Home, Info, Search, Trophy } from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import { User } from '../types';

interface ToolbarProps {
  onZoom: (zoom: number) => void;
  zoom: number;
  onResetView: () => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  allUsers: Omit<User, 'password'>[];
}

export const Toolbar: React.FC<ToolbarProps> = ({ onZoom, zoom, onResetView, onSearch, searchTerm, allUsers }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="bg-white shadow-md p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">The Grid</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search squares..."
            className="pl-10 pr-4 py-2 border rounded-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 flex items-center"
        >
          <Trophy size={18} className="mr-2" />
          Leaderboard
        </button>
        <button
          onClick={onResetView}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          title="Reset View"
        >
          <Home size={24} />
        </button>
        <button
          onClick={() => onZoom(zoom - 0.1)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          title="Zoom Out"
        >
          <ZoomOut size={24} />
        </button>
        <span className="font-medium">{(zoom * 100).toFixed(0)}%</span>
        <button
          onClick={() => onZoom(zoom + 0.1)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          title="Zoom In"
        >
          <ZoomIn size={24} />
        </button>
        <div className="relative group">
          <button
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            title="Information"
          >
            <Info size={24} />
          </button>
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none p-4">
            <h3 className="font-bold mb-2">About The Grid</h3>
            <p className="text-sm">
              The Grid is a collaborative pixel art canvas where users can purchase, customize, and trade squares. Create unique designs, leave your mark, and interact with a global community of artists and creators.
            </p>
          </div>
        </div>
      </div>
      {showLeaderboard && <Leaderboard users={allUsers} onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
};