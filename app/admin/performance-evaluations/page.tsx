'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPerformanceEvaluations,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
} from '@/lib/api/performance-evaluations.api';
import { CreatePerformanceEvaluationDto, PerformanceEvaluation, UpdatePerformanceEvaluationDto } from '@/types/performance-evaluation';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { PerformanceEvaluationForm } from './PerformanceEvaluationForm';
import { PerformanceEvaluationsTable } from './PerformanceEvaluationsTable';
import { BulkUploadDialog } from './BulkUploadDialog';
import { Upload, Plus } from 'lucide-react';

export default function PerformanceEvaluationsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | undefined>(undefined);

  const { data: evaluations = [], isLoading } = useQuery<PerformanceEvaluation[]>({
    queryKey: ['performance-evaluations'],
    queryFn: getPerformanceEvaluations,
  });

  const createMutation = useMutation({
    mutationFn: createPerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation created successfully.');
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create performance evaluation.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePerformanceEvaluationDto }) =>
      updatePerformanceEvaluation(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation updated successfully.');
      setIsDialogOpen(false);
      setSelectedEvaluation(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update performance evaluation.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
      toast.success('Performance evaluation deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete performance evaluation.');
    },
  });

  const handleCreate = () => {
    setSelectedEvaluation(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (evaluation: PerformanceEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  const handleDelete = (evaluation: PerformanceEvaluation) => {
    if (window.confirm(`Are you sure you want to delete this evaluation?`)) {
      deleteMutation.mutate(evaluation._id);
    }
  };

  const handleSubmit = (values: CreatePerformanceEvaluationDto) => {
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
          <h1 className="text-2xl font-bold">Performance Evaluations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage employee performance evaluations and bulk import data
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
          <PerformanceEvaluationForm
            onSubmit={handleSubmit}
            defaultValues={selectedEvaluation}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <BulkUploadDialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} />

      <PerformanceEvaluationsTable
        evaluations={evaluations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
