'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNonTeachingEvaluations,
  createNonTeachingEvaluation,
  updateNonTeachingEvaluation,
  deleteNonTeachingEvaluation,
} from '@/lib/api/non-teaching-evaluations.api';
import { CreateNonTeachingEvaluationDto, NonTeachingEvaluation, UpdateNonTeachingEvaluationDto } from '@/types/non-teaching-evaluation';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { NonTeachingEvaluationForm } from './NonTeachingEvaluationForm';
import { NonTeachingEvaluationsTable } from './NonTeachingEvaluationsTable';
import { NonTeachingBulkUploadDialog } from './NonTeachingBulkUploadDialog';
import { Upload, Plus } from 'lucide-react';

export default function NonTeachingEvaluationsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<NonTeachingEvaluation | undefined>(undefined);

  const { data: evaluations = [], isLoading } = useQuery<NonTeachingEvaluation[]>({
    queryKey: ['non-teaching-evaluations'],
    queryFn: getNonTeachingEvaluations,
  });

  const createMutation = useMutation({
    mutationFn: createNonTeachingEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-teaching-evaluations'] });
      toast.success('Non-teaching evaluation created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create non-teaching evaluation.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdateNonTeachingEvaluationDto }) =>
      updateNonTeachingEvaluation(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-teaching-evaluations'] });
      toast.success('Non-teaching evaluation updated successfully.');
      setIsDialogOpen(false);
      setSelectedEvaluation(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update non-teaching evaluation.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNonTeachingEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-teaching-evaluations'] });
      toast.success('Non-teaching evaluation deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete non-teaching evaluation.');
    },
  });

  const handleCreate = () => {
    setSelectedEvaluation(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (evaluation: NonTeachingEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  const handleDelete = (evaluation: NonTeachingEvaluation) => {
    if (window.confirm(`Are you sure you want to delete this evaluation?`)) {
      deleteMutation.mutate(evaluation._id);
    }
  };

  const handleSubmit = (values: CreateNonTeachingEvaluationDto) => {
    if (selectedEvaluation) {
      updateMutation.mutate({ id: selectedEvaluation._id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Non-Teaching Personnel Evaluations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage non-teaching staff performance evaluations and bulk import data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={handleCreate} className="gap-2 hidden">
            <Plus className="h-4 w-4" />
            Add Evaluation
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvaluation ? 'Edit Evaluation' : 'Add Evaluation'}</DialogTitle>
          </DialogHeader>
          <NonTeachingEvaluationForm
            onSubmit={handleSubmit}
            defaultValues={selectedEvaluation}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <NonTeachingBulkUploadDialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} />

      <NonTeachingEvaluationsTable
        evaluations={evaluations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
