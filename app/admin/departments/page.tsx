'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/api/departments.api';
import { Department } from '@/types/department';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) =>
      updateDepartment(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Departments</h1>
      {/* Add your UI for creating, listing, updating, and deleting departments here */}
    </div>
  );
}
