'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPersonnelWithPredictions, predictPersonnelPerformance } from '@/lib/api/personnel.api';
import { Personnel } from '@/types/personnel';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { PredictionResultDialog } from './PredictionResultDialog';

interface PredictionData {
  prediction: number;
  failedMetrics: string[];
}

export default function PredictionsPage() {
  const queryClient = useQueryClient();
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: personnel = [], isLoading } = useQuery<Personnel[]>({
    queryKey: ['personnelWithPredictions'],
    queryFn: getPersonnelWithPredictions,
  });

  const predictionMutation = useMutation({
    mutationFn: predictPersonnelPerformance,
    onSuccess: (data) => {
      setPredictionData(data);
      queryClient.invalidateQueries({ queryKey: ['personnelWithPredictions'] });
      toast.success(`Prediction complete for ${selectedPersonnel?.firstName}.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to get prediction.');
      setIsDialogOpen(false); // Close dialog on error
    },
  });

  const handlePredictClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setPredictionData(null); // Clear previous data
    setIsDialogOpen(true);
    predictionMutation.mutate(person._id);
  };

  if (isLoading) {
    return <div>Loading personnel data...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Performance Predictions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personnel List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Last Predicted Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personnel.map((person) => (
                <TableRow key={person._id}>
                  <TableCell>{`${person.firstName} ${person.lastName}`}</TableCell>
                  <TableCell>{person.jobTitle}</TableCell>
                  <TableCell>{person.predictedPerformance || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handlePredictClick(person)}
                      disabled={predictionMutation.isPending && selectedPersonnel?._id === person._id}
                      size="sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Predict
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PredictionResultDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        personnel={selectedPersonnel}
        predictionData={predictionData}
        isLoading={predictionMutation.isPending}
      />
    </div>
  );
}
