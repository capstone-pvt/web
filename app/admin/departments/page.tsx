'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/lib/api/departments.api';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '@/types/department';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { DepartmentForm } from './DepartmentForm';
import { DepartmentsTable } from './DepartmentsTable';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully.');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to create department.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateDepartmentDto }) =>
      updateDepartment(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully.');
      setIsDialogOpen(false);
      setSelectedDepartment(null);
    },
    onError: () => {
      toast.error('Failed to update department.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete department.');
    },
  });

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
      deleteMutation.mutate(department._id);
    }
  };

  const handleSubmit = (values: CreateDepartmentDto | UpdateDepartmentDto) => {
    if (selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment._id, data: values });
    } else {
      createMutation.mutate(values as CreateDepartmentDto);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={handleCreate}>Add Department</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDepartment ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <DepartmentForm
            onSubmit={handleSubmit}
            defaultValues={selectedDepartment}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DepartmentsTable departments={departments} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
