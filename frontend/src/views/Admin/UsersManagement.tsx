import React, { useEffect, useState } from 'react';
import { useRequireAuth } from '../../hooks/useAuth';
import { request } from '../../services/api';
import { User } from '../../types';

const UsersManagement: React.FC = () => {
  useRequireAuth(true); // Require admin role
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await request<User[]>({
        method: 'GET',
        url: '/users/',
      });
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Toggle user active status
  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      await request({
        method: 'PATCH',
        url: `/users/${userId}/status`,
        data: { is_active: !isActive },
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };
  
  // Start editing a user
  const handleEdit = (user: User) => {
    setEditMode(user.id);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditMode(null);
    setFormData({});
  };
  
  // Submit edit form
  const handleSubmitEdit = async (e: React.FormEvent, userId: number) => {
    e.preventDefault();
    
    try {
      await request({
        method: 'PUT',
        url: `/users/${userId}`,
        data: formData,
      });
      setEditMode(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Confirm user deletion
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };
  
  // Delete user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await request({
        method: 'DELETE',
        url: `/users/${userToDelete}`,
      });
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setShowDeleteModal(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Zarządzanie użytkownikami</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 px-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Brak użytkowników</h3>
            <p className="text-gray-600">W systemie nie ma jeszcze żadnych użytkowników</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imię i nazwisko</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rola</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                    
                    {editMode === user.id ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    )}
                    
                    {editMode === user.id ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="text" 
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name}</td>
                    )}
                    
                    {editMode === user.id ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          name="role"
                          value={formData.role || ''}
                          onChange={handleInputChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        >
                          <option value="user">Użytkownik</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                        </span>
                      </td>
                    )}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        } cursor-pointer`}
                      >
                        {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                      </button>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editMode === user.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => handleSubmitEdit(e, user.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Zapisz
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Anuluj
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Usuń
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Potwierdź usunięcie
            </h3>
            <p className="text-gray-700 mb-6">
              Czy na pewno chcesz usunąć tego użytkownika? Ta operacja jest nieodwracalna.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
