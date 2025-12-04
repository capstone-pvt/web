'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from '@/lib/api/personnel.api';
import { getDepartments } from '@/lib/api/departments.api';
import { Personnel, UpdatePersonnelDto } from '@/types/personnel';
import { Department } from '@/types/department';

export default function PersonnelPage() {
  const queryClient = useQueryClient();

  const { data: personnel, isLoading: isLoadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const { data: departments, isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createPersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePersonnelDto }) =>
      updatePersonnel(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
    },
  });

  if (isLoadingPersonnel || isLoadingDepartments) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Personnel</h1>
      {/* Add your UI for creating, listing, updating, and deleting personnel here */}
    </div>
  );
}
