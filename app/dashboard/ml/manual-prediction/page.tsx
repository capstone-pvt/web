'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from '@/lib/api/axios';
import { AxiosError } from 'axios'; // Import AxiosError for type checking

const PERFORMANCE_THRESHOLD = 3.5; // Define your threshold for "needs improvement"

export default function ManualPredictPerformancePage() {
  const [metrics, setMetrics] = useState({
    PAA: '',
    KSM: '',
    TS: '',
    CM: '',
    AL: '',
    GO: '',
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isInterventionNeeded, setIsInterventionNeeded] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    // Basic validation
    const numericMetrics = Object.fromEntries(
      Object.entries(metrics).map(([key, value]) => [key, Number.parseFloat(value)])
    );

    if (Object.values(numericMetrics).some(Number.isNaN)) {
      toast.error('Please enter valid numbers for all metrics.');
      return;
    }

    setIsPredicting(true);
    setPrediction(null);
    setIsInterventionNeeded(false);

    try {
      const response = await axios.post('/ml/predict-manual', numericMetrics);

      const data = response.data;
      const predictedScore = Number.parseFloat(data.prediction.toFixed(2));
      setPrediction(predictedScore);

      if (predictedScore < PERFORMANCE_THRESHOLD) {
        setIsInterventionNeeded(true);
        toast.error('Predicted performance indicates need for improvement.');
      } else {
        toast.success('Prediction successful!');
      }
    } catch (error: unknown) { // Use unknown for caught errors
      console.error('Prediction error:', error);
      if (axios.isAxiosError(error)) { // Type guard for AxiosError
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(axiosError.response?.data?.message || 'Error getting prediction.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-linear-to-br from-green-50 to-teal-100">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Input Form */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Predict Personnel Performance (Manual)
          </h1>
          <p className="text-gray-600 mb-6">
            Input the current metrics to generate a predictive score. Metrics should be on a scale, e.g., 1-5.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {Object.keys(metrics).map((key) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                  {key}
                </label>
                <input
                  type="number"
                  id={key}
                  name={key}
                  value={metrics[key as keyof typeof metrics]}
                  onChange={handleChange}
                  step="0.1"
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-full transition duration-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handlePredict}
              disabled={isPredicting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPredicting ? 'Predicting...' : 'Get Prediction'}
            </button>
          </div>
        </div>

        {/* Prediction Result & Intervention */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
          {prediction === null && !isPredicting && (
            <div className="text-gray-500">
              <p className="mb-4">Enter metrics and click &quot;Get Prediction&quot; to see results.</p>
              <p className="text-sm">Based on model trained on [date].</p>
            </div>
          )}

          {isPredicting && (
            <div className="text-blue-600 text-xl font-semibold animate-pulse">Calculating Prediction...</div>
          )}

          {prediction !== null && (
            <>
              <p className="text-6xl font-extrabold text-indigo-700 mb-4">{prediction}</p>
              <p className="text-xl font-semibold text-gray-700 mb-4">Predicted Performance (GEN AVG)</p>

              {isInterventionNeeded ? (
                <div className="text-red-600 text-lg font-semibold mb-4 animate-bounce">
                  <span aria-hidden="true">⚠️</span> Needs Improvement!
                </div>
              ) : (
                <div className="text-green-600 text-lg font-semibold mb-4">
                  <span aria-hidden="true">✅</span> Prediction successful!
                </div>
              )}

              {isInterventionNeeded && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md w-full mb-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Recommended Actions:</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Enroll in Training Seminar for relevant skills.</li>
                    <li>Develop a Performance Improvement Plan (PIP).</li>
                    <li>Seek mentorship.</li>
                  </ul>
                  <button
                    onClick={() => toast.success('Suggesting training seminar (this would navigate to an external system or internal page)')}
                    className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-5 rounded-full transition duration-200 shadow-md"
                  >
                    Suggest Training Seminar
                  </button>
                </div>
              )}

              <p className="text-gray-500 text-sm mt-auto">
                Model trained on: {new Date().toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
