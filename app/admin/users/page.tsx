'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { IUser } from '@/lib/db/models/User';
import { IRole } from '@/lib/db/models/Role';

const UsersPage = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`/api/users?page=${currentPage}`),
        axios.get('/api/roles'),
      ]);
      setUsers(usersRes.data.data.users);
      setTotalPages(usersRes.data.data.totalPages);
      setRoles(rolesRes.data.data.roles);
    };
    fetchData();
  }, [currentPage]);

  const handleUserSelect = (user: IUser) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map((r) => r.toString()));
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`/api/users/${selectedUser._id}/roles`, {
        roles: selectedRoles,
      });
      // Refresh users data
      const usersRes = await axios.get(`/api/users?page=${currentPage}`);
      setUsers(usersRes.data.data.users);
    } catch (error) {
      console.error('Failed to update user roles', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Roles</h1>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <ul>
            {users.map((user) => (
              <li
                key={user._id.toString()}
                className={`cursor-pointer p-2 ${
                  selectedUser?._id === user._id ? 'bg-blue-500 text-white' : ''
                }`}
                onClick={() => handleUserSelect(user)}
              >
                {user.email}
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
        <div className="col-span-2">
          {selectedUser && (
            <>
              <h2 className="text-xl font-semibold">
                Roles for {selectedUser.email}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <div key={role._id.toString()}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role._id.toString())}
                        onChange={() => handleRoleChange(role._id.toString())}
                      />
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
              <button
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
