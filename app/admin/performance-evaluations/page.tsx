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

export default function PerformanceEvaluationsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PerformanceEvaluation | null>(null);

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
      setSelectedEvaluation(null);
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
    setSelectedEvaluation(null);
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Performance Evaluations</h1>
        <Button onClick={handleCreate}>Add Evaluation</Button>
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

      <PerformanceEvaluationsTable
        evaluations={evaluations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
