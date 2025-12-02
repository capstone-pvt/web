'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { IRole } from '@/lib/db/models/Role';
import { IPermission } from '@/lib/db/models/Permission';
import ProtectedRoute from '@/app/components/guards/ProtectedRoute';
import { PERMISSIONS } from '@/config/permissions';

const RolesPage = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [rolesRes, permissionsRes] = await Promise.all([
        axios.get('/api/roles'),
        axios.get('/api/permissions'),
      ]);
      setRoles(rolesRes.data.data.roles);
      setPermissions(permissionsRes.data.data.permissions);
    };
    fetchData();
  }, []);

  const handleRoleSelect = (role: IRole) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map((p) => p.toString()));
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    try {
      await axios.put(`/api/roles/${selectedRole._id}`, {
        permissions: selectedPermissions,
      });
      // Refresh roles data
      const rolesRes = await axios.get('/api/roles');
      setRoles(rolesRes.data.data.roles);
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  return (
    <ProtectedRoute permissions={[PERMISSIONS.ROLES_READ, PERMISSIONS.ROLES_UPDATE]}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Roles and Permissions</h1>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-xl font-semibold">Roles</h2>
            <ul>
              {roles.map((role) => (
                <li
                  key={role._id.toString()}
                  className={`cursor-pointer p-2 ${
                    selectedRole?._id === role._id ? 'bg-blue-500 text-white' : ''
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2">
            {selectedRole && (
              <>
                <h2 className="text-xl font-semibold">
                  Permissions for {selectedRole.name}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission._id.toString()}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission._id.toString())}
                          onChange={() => handlePermissionChange(permission._id.toString())}
                        />
                        {permission.name}
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
    </ProtectedRoute>
  );
};

export default RolesPage;
