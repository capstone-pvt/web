'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/api/axios';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Upload } from 'lucide-react';

export default function TrainingPage() {
  const [file, setFile] = useState<File | null>(null);

  const trainMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return axios.post('/ml/train', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response) => {
      toast.success(`Model trained successfully with ${response.data.records} records.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to train model.');
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    trainMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Train Prediction Model</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Training Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Upload an Excel file (.xlsx, .xls, .csv) with personnel data. The file must contain the following columns: 
            <strong>PAA, KSM, TS, CM, AL, GO, GEN AVG</strong>.
          </p>
          <div className="flex items-center space-x-2">
            <Input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
          </div>
          <Button onClick={handleSubmit} disabled={trainMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {trainMutation.isPending ? 'Training...' : 'Train Model'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
