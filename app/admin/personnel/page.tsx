'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from '@/lib/api/personnel.api';
import { getDepartments } from '@/lib/api/departments.api';
import { Personnel, CreatePersonnelDto, UpdatePersonnelDto } from '@/types/personnel';
import { Department } from '@/types/department';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'; // Removed DialogTrigger
import { PersonnelForm } from './PersonnelForm';
import { PersonnelTable } from './PersonnelTable';
import { BulkUploadDialog } from './BulkUploadDialog';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function PersonnelPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  const { data: personnel = [], isLoading: isLoadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createPersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel created successfully.');
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to create personnel.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePersonnelDto }) =>
      updatePersonnel(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel updated successfully.');
      setIsDialogOpen(false);
      setSelectedPersonnel(null);
    },
    onError: () => {
      toast.error('Failed to update personnel.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePersonnel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Personnel deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete personnel.');
    },
  });

  const handleCreate = () => {
    setSelectedPersonnel(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setSelectedPersonnel(person);
    setIsDialogOpen(true);
  };

  const handleDelete = (person: Personnel) => {
    if (window.confirm(`Are you sure you want to delete ${person.firstName} ${person.lastName}?`)) {
      deleteMutation.mutate(person._id);
    }
  };

  const handleSubmit = (values: CreatePersonnelDto | UpdatePersonnelDto) => {
    if (selectedPersonnel) {
      updateMutation.mutate({ id: selectedPersonnel._id, data: values });
    } else {
      createMutation.mutate(values as CreatePersonnelDto);
    }
  };

  if (isLoadingPersonnel || isLoadingDepartments) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Personnel</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate}>Add Personnel</Button>
        </div>
      </div>

      <BulkUploadDialog
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPersonnel ? 'Edit Personnel' : 'Add Personnel'}</DialogTitle>
          </DialogHeader>
          <PersonnelForm
            onSubmit={handleSubmit}
            defaultValues={selectedPersonnel}
            departments={departments}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <PersonnelTable personnel={personnel} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
