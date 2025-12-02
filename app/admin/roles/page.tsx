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

interface Permission {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

interface Role {
  _id: string;
  id:string;
  name: string;
  displayName: string;
  description: string;
  hierarchy: number;
  permissions: Permission[];
  userCount?: number;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  // State to control which accordion item is open
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/roles');
      if (response.data.success) {
        setRoles(response.data.data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  return (
    <PermissionGate permission={PERMISSIONS.ROLES_READ}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Role Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage system roles and permissions
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">No roles found</p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              value={openAccordionItem}
              onValueChange={setOpenAccordionItem}
            >
              {roles.map((role) => {
                const groupedPermissions = groupPermissionsByCategory(role.permissions);
                return (
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
                            {role.permissions.length} permissions
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-750">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                          Permissions by Category
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(groupedPermissions).map(([category, perms]) => (
                            <div key={category}>
                              <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                {category}
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {perms.map((perm) => (
                                  <div
                                    key={perm._id}
                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
                                  >
                                    <svg
                                      className="w-4 h-4 text-green-500 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {perm.displayName}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {perm.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}
