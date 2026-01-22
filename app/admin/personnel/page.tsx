'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  classifyAllPersonnel,
  calculateExcellenceForAll,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { PersonnelForm } from './PersonnelForm';
import { PersonnelTable } from './PersonnelTable';
import { BulkUploadDialog } from './BulkUploadDialog';
import { ExcellenceAnalytics } from './ExcellenceAnalytics';
import { toast } from 'sonner';
import { Upload, UserCheck, Award } from 'lucide-react';

export default function PersonnelPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [excellenceFilter, setExcellenceFilter] = useState<string>('all');

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

  const classifyMutation = useMutation({
    mutationFn: classifyAllPersonnel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success(
        `Classification complete! ${data.classified} classified, ${data.skipped} skipped.`
      );
    },
    onError: () => {
      toast.error('Failed to classify personnel.');
    },
  });

  const excellenceMutation = useMutation({
    mutationFn: calculateExcellenceForAll,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success(
        `Excellence calculation complete! ${data.length} personnel evaluated.`
      );
    },
    onError: () => {
      toast.error('Failed to calculate excellence.');
    },
  });

  const filteredPersonnel = useMemo(() => {
    if (excellenceFilter === 'all') return personnel;
    return personnel.filter((p) => p.excellenceStatus === excellenceFilter);
  }, [personnel, excellenceFilter]);

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
          <Button
            onClick={() => excellenceMutation.mutate({ startYear: 2020, endYear: 2025, threshold: 4.0 })}
            variant="outline"
            disabled={excellenceMutation.isPending}
          >
            <Award className="mr-2 h-4 w-4" />
            {excellenceMutation.isPending ? 'Calculating...' : 'Calculate Excellence'}
          </Button>
          <Button
            onClick={() => classifyMutation.mutate()}
            variant="outline"
            disabled={classifyMutation.isPending}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            {classifyMutation.isPending ? 'Classifying...' : 'Classify All'}
          </Button>
          <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate}>Add Personnel</Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium">Filter by Excellence:</label>
          <Select value={excellenceFilter} onValueChange={setExcellenceFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Average">Average</SelectItem>
              <SelectItem value="Below Average">Below Average</SelectItem>
              <SelectItem value="Not Evaluated">Not Evaluated</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {filteredPersonnel.length} of {personnel.length} personnel
          </span>
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

      <PersonnelTable personnel={filteredPersonnel} onEdit={handleEdit} onDelete={handleDelete} />

      <div className="mt-8">
        <ExcellenceAnalytics />
      </div>
    </div>
  );
}
