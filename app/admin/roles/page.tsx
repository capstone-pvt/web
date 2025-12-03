'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { toast } from 'sonner';
import { useHeader } from '@/lib/contexts/HeaderContext';

// Type Definitions
interface Permission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Permission[];
  userCount?: number;
}

// Child Component for rendering a category of permissions
const PermissionCategory = ({ category, perms, roleId, checkedPermissions, onPermissionChange }: {
  category: string;
  perms: Permission[];
  roleId: string;
  checkedPermissions: string[];
  onPermissionChange: (roleId: string, permissionId: string, checked: boolean) => void;
}) => (
  <div key={category}>
    <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
      {category}
    </h5>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {perms.map((perm) => (
        <div key={perm._id} className="flex items-center gap-2">
          <Checkbox
            id={`perm-${roleId}-${perm._id}`}
            checked={checkedPermissions.includes(perm._id)}
            onCheckedChange={(checked) => onPermissionChange(roleId, perm._id, !!checked)}
          />
          <label
            htmlFor={`perm-${roleId}-${perm._id}`}
            className="text-sm font-medium text-gray-800 dark:text-gray-200"
          >
            {perm.displayName}
          </label>
        </div>
      ))}
    </div>
  </div>
);

// Child Component for a single role's accordion item
const RoleAccordionItem = ({ role, groupedPermissions, editingPermissions, onPermissionChange, onSaveChanges }: {
  role: Role;
  groupedPermissions: Record<string, Permission[]>;
  editingPermissions: string[];
  onPermissionChange: (roleId: string, permissionId: string, checked: boolean) => void;
  onSaveChanges: (roleId: string) => void;
}) => (
  <AccordionItem value={role._id} key={role._id}>
    <AccordionTrigger>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {role.displayName}
          </h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Hierarchy: {role.hierarchy}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {role.description}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {editingPermissions.length} permissions
          </span>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Edit Permissions
        </h4>
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <PermissionCategory
              key={category}
              category={category}
              perms={perms}
              roleId={role._id}
              checkedPermissions={editingPermissions}
              onPermissionChange={onPermissionChange}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <PermissionGate permission={PERMISSIONS.ROLES_UPDATE}>
            <Button onClick={() => onSaveChanges(role._id)}>
              Save Changes
            </Button>
          </PermissionGate>
        </div>
      </div>
    </AccordionContent>
  </AccordionItem>
);

// Main Page Component
export default function RolesPage() {
  const { setTitle } = useHeader();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>();
  const [editingPermissions, setEditingPermissions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setTitle('Role Management');
  }, [setTitle]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        axios.get('/api/roles'),
        axios.get('/api/permissions'),
      ]);

      if (rolesRes.data.success) {
        const fetchedRoles = rolesRes.data.data.roles;
        setRoles(fetchedRoles);
        const initialEditingState: Record<string, string[]> = {};
        fetchedRoles.forEach((role: Role) => {
          initialEditingState[role._id] = role.permissions.map(p => p._id);
        });
        setEditingPermissions(initialEditingState);
      }

      if (permissionsRes.data.success) {
        setAllPermissions(permissionsRes.data.data.permissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(.
      false);
    }
  };

  const handlePermissionChange = (roleId: string, permissionId: string, checked: boolean) => {
    setEditingPermissions(prev => {
      const currentPermissions = prev[roleId] || [];
      if (checked) {
        return { ...prev, [roleId]: [...currentPermissions, permissionId] };
      } else {
        return { ...prev, [roleId]: currentPermissions.filter(id => id !== permissionId) };
      }
    });
  };

  const handleSaveChanges = async (roleId: string) => {
    try {
      const permissionsToSave = editingPermissions[roleId] || [];
      await axios.put(`/api/roles/${roleId}`, { permissions: permissionsToSave });
      toast.success('Role updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const groupedAllPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
        </div>
      );
    }

    if (roles.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No roles found</p>
        </div>
      );
    }

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={openAccordionItem}
        onValueChange={setOpenAccordionItem}
      >
        {roles.map((role) => (
          <RoleAccordionItem
            key={role._id}
            role={role}
            groupedPermissions={groupedAllPermissions}
            editingPermissions={editingPermissions[role._id] || []}
            onPermissionChange={handlePermissionChange}
            onSaveChanges={handleSaveChanges}
          />
        ))}
      </Accordion>
    );
  };

  return (
    <PermissionGate permission={PERMISSIONS.ROLES_READ}>
      <div className="space-y-4">{renderContent()}</div>
    </PermissionGate>
  );
}
