'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { IPermission } from '@/lib/db/models/Permission';
import PermissionGate from '@/app/components/guards/PermissionGate';
import { PERMISSIONS } from '@/config/permissions';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [editingPermission, setEditingPermission] = useState<IPermission | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    category: '',
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const res = await axios.get('/api/permissions');
    setPermissions(res.data.data.permissions);
  };

  const handleCreate = async () => {
    await axios.post('/api/permissions', newPermission);
    fetchPermissions();
    setNewPermission({
      name: '',
      displayName: '',
      description: '',
      resource: '',
      action: '',
      category: '',
    });
  };

  const handleUpdate = async (id: string) => {
    if (!editingPermission) return;
    await axios.put(`/api/permissions/${id}`, editingPermission);
    fetchPermissions();
    setEditingPermission(null);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/permissions/${id}`);
    fetchPermissions();
  };

  return (
    <PermissionGate permission={PERMISSIONS.PERMISSIONS_MANAGE}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Permissions</h1>

        {/* Create Form */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Create Permission</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(newPermission).map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key}
                value={newPermission[key as keyof typeof newPermission]}
                onChange={(e) =>
                  setNewPermission({ ...newPermission, [key]: e.target.value })
                }
                className="p-2 border"
              />
            ))}
          </div>
          <button onClick={handleCreate} className="mt-4 bg-blue-500 text-white p-2">
            Create
          </button>
        </div>

        {/* Permissions List */}
        <div>
          <h2 className="text-xl font-semibold">Existing Permissions</h2>
          {permissions.map((p) => (
            <div key={p._id.toString()} className="p-4 border-b">
              {editingPermission?._id === p._id ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(newPermission).map((key) => (
                    <input
                      key={key}
                      type="text"
                      value={editingPermission[key as keyof IPermission] as string}
                      onChange={(e) =>
                        setEditingPermission({
                          ...editingPermission,
                          [key]: e.target.value,
                        } as IPermission)
                      }
                      className="p-2 border"
                    />
                  ))}
                  <button onClick={() => handleUpdate(p._id.toString())} className="bg-green-500 text-white p-2">
                    Save
                  </button>
                  <button onClick={() => setEditingPermission(null)} className="bg-gray-500 text-white p-2">
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold">{p.displayName}</h3>
                  <p>{p.description}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditingPermission(p)} className="bg-yellow-500 text-white p-2">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id.toString())} className="bg-red-500 text-white p-2">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PermissionGate>
  );
};

export default PermissionsPage;
