import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreVertical } from 'lucide-react';

// Mock data
const mockUsers = [
  { id: '1', username: 'john_doe', email: 'john@example.com', role: 'USER', status: 'Active', joined: '2024-01-15' },
  { id: '2', username: 'jane_smith', email: 'jane@example.com', role: 'USER', status: 'Active', joined: '2024-02-20' },
  { id: '3', username: 'admin_user', email: 'admin@hiura.com', role: 'ADMIN', status: 'Active', joined: '2023-12-01' },
  { id: '4', username: 'bob_wilson', email: 'bob@example.com', role: 'USER', status: 'Suspended', joined: '2024-03-10' },
  { id: '5', username: 'alice_wonder', email: 'alice@example.com', role: 'USER', status: 'Active', joined: '2024-04-05' },
];

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-500 mt-1">Manage user accounts</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 font-medium p-4">User</th>
              <th className="text-left text-gray-500 font-medium p-4">Role</th>
              <th className="text-left text-gray-500 font-medium p-4">Status</th>
              <th className="text-left text-gray-500 font-medium p-4">Joined</th>
              <th className="text-left text-gray-500 font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{user.joined}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <p className="text-gray-500 text-sm">Showing 1-5 of 45,234 users</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">2</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">3</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
