'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Personnel } from '@/types/personnel';

interface PredictionResultDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  personnel: Personnel | null;
  predictionData: { prediction: number; failedMetrics: string[] } | null;
  isLoading: boolean;
}

const trainingSuggestions: Record<string, string> = {
  PAA: 'Professionalism & Attitude Workshop',
  KSM: 'Knowledge & Skills Mastery Seminar',
  TS: 'Teamwork & Collaboration Training',
  CM: 'Communication Mastery Course',
  AL: 'Adaptive Leadership Program',
  GO: 'Goal-Oriented Execution Workshop',
};

export function PredictionResultDialog({
  isOpen,
  onOpenChange,
  personnel,
  predictionData,
  isLoading,
}: PredictionResultDialogProps) {
  if (!personnel) return null;

  // Use optional chaining (?.) for a safe check.
  // This prevents the error if `failedMetrics` is not present on `predictionData`.
  const isInterventionNeeded = (predictionData?.failedMetrics?.length ?? 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prediction for {personnel.firstName} {personnel.lastName}</DialogTitle>
          <DialogDescription>
            Based on the latest available data and the trained model.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center py-6">
          {isLoading && <div className="animate-pulse">Calculating...</div>}
          {predictionData && !isLoading && (
            <>
              <p className="text-6xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">
                {predictionData.prediction}
              </p>
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Predicted Performance (GEN AVG)
              </p>
              {isInterventionNeeded ? (
                <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">
                  <span aria-hidden="true">⚠️</span> Needs Improvement!
                </div>
              ) : (
                <div className="text-green-600 dark:text-green-400 text-lg font-semibold mb-4">
                  <span aria-hidden="true">✅</span> Meets Expectations!
                </div>
              )}
              {isInterventionNeeded && (
                <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md w-full mb-4 text-left">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Recommended Actions:
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {predictionData.failedMetrics.map(metric => (
                      <li key={metric}>
                        <strong>{metric}:</strong> {trainingSuggestions[metric] || 'Further review needed.'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
