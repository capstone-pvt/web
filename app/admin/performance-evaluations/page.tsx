'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPerformanceEvaluations,
  createPerformanceEvaluation,
  updatePerformanceEvaluation,
  deletePerformanceEvaluation,
} from '@/lib/api/performance-evaluations.api';
import { PerformanceEvaluation, UpdatePerformanceEvaluationDto } from '@/types/performance-evaluation';

export default function PerformanceEvaluationsPage() {
  const queryClient = useQueryClient();

  const { data: evaluations, isLoading } = useQuery<PerformanceEvaluation[]>({
    queryKey: ['performance-evaluations'],
    queryFn: getPerformanceEvaluations,
  });

  const createMutation = useMutation({
    mutationFn: createPerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: UpdatePerformanceEvaluationDto }) =>
      updatePerformanceEvaluation(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePerformanceEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-evaluations'] });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Performance Evaluations</h1>
      <ul>
        {evaluations?.map((evaluation) => (
          <li key={evaluation._id}>
            {evaluation.personnel.firstName} {evaluation.personnel.lastName} -{' '}
            {new Date(evaluation.evaluationDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
      {/* Add your UI for creating, updating, and deleting evaluations here */}
    </div>
  );
}
