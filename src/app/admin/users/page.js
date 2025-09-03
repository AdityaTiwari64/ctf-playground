"use client";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    score: 0,
    role: "user",
    isVerified: false,
    adminPassword: ""
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "sudo") {
      router.push("/");
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users?admin=true");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error("Error fetching users:", data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditForm({
      username: userToEdit.username || "",
      email: userToEdit.email || "",
      score: userToEdit.score || 0,
      role: userToEdit.role || "user",
      isVerified: userToEdit.isVerified || false,
      adminPassword: ""
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editForm.adminPassword) {
      alert("Admin password is required");
      return;
    }

    try {
      const response = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          score: parseInt(editForm.score),
          role: editForm.role,
          isVerified: editForm.isVerified,
          adminPassword: editForm.adminPassword,
          adminId: user._id || user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User updated successfully!");
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    const adminPassword = prompt("Enter your admin password to confirm deletion:");
    if (!adminPassword) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminPassword: adminPassword,
          adminId: user._id || user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  if (!user || user.role !== "sudo") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Manage user accounts, scores, and permissions</p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-blue-400">{users.length}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.isVerified).length}
            </div>
            <div className="text-gray-400">Verified Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-purple-400">
              {users.filter(u => u.role === 'sudo').length}
            </div>
            <div className="text-gray-400">Admin Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-2xl font-bold text-orange-400">
              {users.filter(u => u.score > 0).length}
            </div>
            <div className="text-gray-400">Active Players</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                            {userItem.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {userItem.username}
                          </div>
                          <div className="text-sm text-gray-400">
                            ID: {userItem._id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {userItem.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-400">
                        {userItem.score || 0} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        userItem.role === 'sudo' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {userItem.role === 'sudo' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        userItem.isVerified 
                          ? 'bg-green-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {userItem.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium"
                      >
                        Edit
                      </button>
                      {userItem._id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(userItem._id, userItem.username)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Edit User: {editingUser.username}</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Score</label>
                  <input
                    type="number"
                    name="score"
                    value={editForm.score}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="sudo">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={editForm.isVerified}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Verified User</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Password</label>
                  <input
                    type="password"
                    name="adminPassword"
                    value={editForm.adminPassword}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter your admin password"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium"
                  >
                    Update User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}