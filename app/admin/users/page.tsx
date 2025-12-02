'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/api/axios';
import { PERMISSIONS } from '@/config/permissions';
import PermissionGate from '@/app/components/guards/PermissionGate';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  PageHeader,
  DataTable
} from '@/app/components/ui';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  roles: Array<{ _id: string; name: string; displayName: string }>;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await axios.get(`/api/users?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Role',
      render: (_: any, user: User) => (
        <Badge variant="secondary">
          {user.roles[0]?.displayName || 'No Role'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (_: any, user: User) => (
        <Badge variant={user.isActive ? 'default' : 'destructive'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (_: any, user: User) => (
        <span className="text-sm text-muted-foreground">
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString()
            : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, user: User) => (
        <div className="flex justify-end gap-2">
          <PermissionGate permission={PERMISSIONS.USERS_UPDATE}>
            <Link href={`/admin/users/${user._id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil1Icon className="h-4 w-4" />
              </Button>
            </Link>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.USERS_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(user._id)}
            >
              <TrashIcon className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGate>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <PermissionGate permission={PERMISSIONS.USERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage user accounts and permissions"
          action={
            <PermissionGate permission={PERMISSIONS.USERS_CREATE}>
              <Link href="/admin/users/create">
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </Link>
            </PermissionGate>
          }
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              emptyMessage="No users found"
            />

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
