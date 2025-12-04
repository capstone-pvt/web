'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  useTrainingHistory,
  useCurrentModel,
  useTrainModel,
} from '@/lib/hooks/useMLTraining';
import { LoadingSkeleton,ErrorDisplay } from '@/app/components/ui';
import {
  Brain,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  Settings,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/app/components/ui/dialog';

export default function TrainingPage() {
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useTrainingHistory();
  const {
    data: currentModel,
    isLoading: modelLoading,
    error: modelError,
  } = useCurrentModel();
  const trainMutation = useTrainModel();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [learningRate, setLearningRate] = useState('0.001');
  const [epochs, setEpochs] = useState('100');
  const [batchSize, setBatchSize] = useState('32');

  const handleTrainModel = () => {
    trainMutation.mutate(
      {
        hyperparameters: {
          learningRate: parseFloat(learningRate),
          epochs: parseInt(epochs),
          batchSize: parseInt(batchSize),
        },
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'training':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      case 'training':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (historyLoading || modelLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Model Training</h1>
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  if (historyError || modelError) {
    return (
      <ErrorDisplay
        message={historyError?.message || modelError?.message || 'Failed to load training data'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Model Training
          </h1>
          <p className="text-muted-foreground mt-1">
            Train and manage ML models for performance prediction
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Train New Model
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Train New Model</DialogTitle>
              <DialogDescription>
                Configure hyperparameters for model training. This process may take several
                minutes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="learningRate">Learning Rate</Label>
                <Input
                  id="learningRate"
                  type="number"
                  step="0.0001"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value)}
                  placeholder="0.001"
                />
                <p className="text-xs text-muted-foreground">
                  Typical values: 0.001 - 0.01
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(e.target.value)}
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Number of training iterations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  placeholder="32"
                />
                <p className="text-xs text-muted-foreground">
                  Typical values: 16, 32, 64
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={trainMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTrainModel}
                disabled={trainMutation.isPending}
                className="gap-2"
              >
                {trainMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start Training
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Model Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentModel?.modelVersion || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentModel
                ? (currentModel.metrics.accuracy * 100).toFixed(2) + '%'
                : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dataset Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentModel?.datasetSize.toLocaleString() || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trained On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {currentModel
                ? new Date(currentModel.trainingDate).toLocaleDateString()
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Model Details */}
      {currentModel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Model Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Hyperparameters</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">Learning Rate</span>
                    <span className="text-sm font-medium">
                      {currentModel.hyperparameters.learningRate}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">Epochs</span>
                    <span className="text-sm font-medium">
                      {currentModel.hyperparameters.epochs}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">Batch Size</span>
                    <span className="text-sm font-medium">
                      {currentModel.hyperparameters.batchSize}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">MSE</span>
                    <span className="text-sm font-medium">
                      {currentModel.metrics.mse.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">MAE</span>
                    <span className="text-sm font-medium">
                      {currentModel.metrics.mae.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm text-muted-foreground">F1 Score</span>
                    <span className="text-sm font-medium">
                      {currentModel.metrics.f1Score.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Training History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Previous model training sessions
          </p>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{session.modelVersion}</p>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.trainingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-semibold text-green-600">
                        {(session.metrics.accuracy * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Dataset</p>
                      <p className="font-semibold">
                        {session.datasetSize.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">MAE</p>
                      <p className="font-semibold">{session.metrics.mae.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No training history available</p>
              <p className="text-sm">Start by training your first model</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
