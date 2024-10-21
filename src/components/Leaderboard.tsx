import React from 'react';
import { X } from 'lucide-react';

interface LeaderboardProps {
  users: Omit<User, 'password'>[];
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onClose }) => {
  const sortedUsers = [...users].sort((a, b) => b.squaresOwned - a.squaresOwned).slice(0, 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">Username</th>
              <th className="text-right">Squares Owned</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={user.username} className="border-t">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{user.username}</td>
                <td className="py-2 text-right">{user.squaresOwned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};